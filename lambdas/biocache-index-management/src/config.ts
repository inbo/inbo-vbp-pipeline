function RequiredVar(name: string): never {
    throw new Error(`${name} is not defined`);
}

export default {
    solrBaseUrl: process.env.SOLR_BASE_URL || RequiredVar("SOLR_BASE_URL"),
    solrBiocacheSchemaConfig: process.env.SOLR_BIOCACHE_SCHEMA_CONFIG ||
        "biocache",
    solrBiocacheActiveAlias: process.env.SOLR_BIOCACHE_ACTIVE_ALIAS ||
        "biocache",
    solrBiocacheNumberOfShards: parseInt(
        process.env.SOLR_BIOCACHE_NUMBER_OF_SHARDS ||
            "1",
    ),
    solrBiocacheMaxShardsPerNode: parseInt(
        process.env.SOLR_BIOCACHE_MAX_SHARDS_PER_NODE ||
            "1",
    ),
    jwksUri: process.env.JWKS_URI || RequiredVar("JWKS_URI"),
};
