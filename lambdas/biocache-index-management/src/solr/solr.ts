import { Index, IndexDetails } from "../core/index-service";
import { IndexService } from "../core/index-service";

export interface SolrClientConfig {
  solrBaseUrl: string;
  solrBiocacheIndexNamePrefix: string;
  solrBiocacheSchemaConfig: string;
  solrBiocacheActiveAlias: string;
  solrBiocacheNumberOfShards: number;
  solrBiocacheMaxShardsPerNode: number;
}

export class SolrClient implements IndexService {
  constructor(private readonly config: SolrClientConfig) {}

  async getIndex(id: string): Promise<IndexDetails | null> {
    const response = await fetch(
      `${this.config.solrBaseUrl}/${id}/query?q=*:*&q.op=OR&indent=true&rows=0&facet=true&facet.field=dataResourceUid&omitHeader=true`,
    );
    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }

      const errorBody = await response.text();
      throw new Error(
        `Failed to get index ${id}: ${response.statusText}\n${errorBody}`,
      );
    }
    const data = await response.json();
    console.debug("Get collection counts:", data);

    return {
      id,
      totalCount: data.response.numFound,
      dataResourceCounts: data.facet_counts.facet_fields.dataResourceUid.reduce(
        (
          acc: { [dataResourceId: string]: number },
          val: string,
          idx: number,
        ) => {
          if (idx % 2 === 0) {
            acc[val] = data.facet_counts.facet_fields.dataResourceUid[idx + 1];
          }
          return acc;
        },
        {},
      ),
    };
  }

  async getIndices(): Promise<Index[]> {
    const response = await fetch(
      `${this.config.solrBaseUrl}/admin/collections?action=LIST&omitHeader=true`,
    );
    const data = await response.json();
    console.debug("List collections data:", data);
    return (
      data.collections
        ?.filter((id: string) =>
          id.startsWith(this.config.solrBiocacheIndexNamePrefix),
        )
        .map((id: string) => ({ id }))
        .sort((a: Index, b: Index) => -a.id.localeCompare(b.id)) || []
    );
  }

  async createIndex(id: string): Promise<Index> {
    // Create if not found
    const response = await fetch(
      `${this.config.solrBaseUrl}/admin/collections?action=CREATE&name=${id}&collection.configName=${this.config.solrBiocacheSchemaConfig}&numShards=${this.config.solrBiocacheNumberOfShards}&maxShardsPerNode=${this.config.solrBiocacheMaxShardsPerNode}&omitHeader=true`,
    );
    console.debug(
      "Create index response: " +
        `${this.config.solrBaseUrl}/admin/collections?action=CREATE&name=${id}&collection.configName=${this.config.solrBiocacheSchemaConfig}&numShards=${this.config.solrBiocacheNumberOfShards}&maxShardsPerNode=${this.config.solrBiocacheMaxShardsPerNode}&omitHeader=true`,
    );
    if (response.ok) {
      const data = await response.json();
      console.debug("Create collection data:", data);
      if (!data.success) {
        throw new Error(`Failed to create index: ${JSON.stringify(data)}`);
      }
      return { id };
    } else {
      const errorBody = await response.text();
      throw new Error(
        `Failed to get or create index: ${response.statusText}\n${errorBody}`,
      );
    }
  }

  async deleteIndex(id: string): Promise<void> {
    const response = await fetch(
      `${this.config.solrBaseUrl}/admin/collections?action=DELETE&name=${id}&omitHeader=true`,
    );
    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(
        `Failed to delete index ${id}: ${response.statusText}\n${errorBody}`,
      );
    }
    console.debug("Delete response:", response);
  }

  async deleteDataResourceOccurrencesFromIndex(
    indexId: string,
    dataResourceId: string,
  ): Promise<void> {
    const response = await fetch(
      `${this.config.solrBaseUrl}/${indexId}/update/json?commit=true`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          delete: { query: `dataResourceUid:${dataResourceId}` },
        }),
      },
    );

    console.warn(
      JSON.stringify({
        delete: { query: `dataResourceUid:${dataResourceId}` },
      }),
    );

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(
        `Failed to delete data resource ${dataResourceId} occurrences from index ${indexId}: ${response.statusText}\n${errorBody}`,
      );
    }
    console.info(
      "Delete data resource occurrences response:",
      response,
      await response.json(),
    );
  }

  async getConfigs(): Promise<string[]> {
    const response = await fetch(
      `${this.config.solrBaseUrl}/admin/configs?action=LIST&omitHeader=true`,
    );
    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(
        `Failed to get configs: ${response.statusText}\n${errorBody}`,
      );
    }
    const data = await response.json();
    return data.configSets;
  }

  async getActiveIndex(): Promise<Index | null> {
    const response = await fetch(
      `${this.config.solrBaseUrl}/admin/collections?action=LISTALIASES&omitHeader=true`,
    );
    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(
        `Failed to get active index: ${response.statusText}\n${errorBody}`,
      );
    }
    const data = await response.json();
    console.debug("Get alias data:", data);
    if (data.aliases?.[this.config.solrBiocacheActiveAlias]) {
      return { id: data.aliases[this.config.solrBiocacheActiveAlias] };
    } else {
      return null;
    }
  }
  async setActiveIndex(id: string): Promise<void> {
    await this.deleteAlias(this.config.solrBiocacheActiveAlias);
    await this.createAlias(this.config.solrBiocacheActiveAlias, [id]);
  }

  private async createAlias(
    name: string,
    collections: string[],
  ): Promise<void> {
    const response = await fetch(
      `${this.config.solrBaseUrl}/admin/collections?action=CREATEALIAS&name=${name}&collections=${collections.join(
        ",",
      )}&omitHeader=true`,
    );
    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(
        `Failed to create alias ${name} for collections ${collections.join(
          ", ",
        )}: ${response.statusText}\n${errorBody}`,
      );
    }
  }

  private async deleteAlias(name: string): Promise<void> {
    const response = await fetch(
      `${this.config.solrBaseUrl}/admin/collections?action=DELETEALIAS&name=${name}&omitHeader=true`,
    );
    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(
        `Failed to delete alias ${name}: ${response.statusText}\n${errorBody}`,
      );
    }
  }
}
