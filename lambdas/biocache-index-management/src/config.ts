function RequiredVar(name: string): never {
    throw new Error(`${name} is not defined`);
}

export default {
    solrBaseUrl: process.env.SOLR_BASE_URL || RequiredVar("SOLR_BASE_URL"),
    solrBiocacheIndexNamePrefix: process.env.SOLR_BIOCACHE_INDEX_NAME_PREFIX ||
        "biocache",
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
    collectoryBaseUrl: process.env.COLLECTORY_BASE_URL ||
        RequiredVar("COLLECTORY_BASE_URL"),
    awsBaseUrl: process.env.AWS_BASE_URL,
    awsStateMachineArn: process.env.AWS_STATE_MACHINE_ARN ||
        RequiredVar("AWS_STATE_MACHINE_ARN"),
    awsDynamoDBTableName: process.env.AWS_DYNAMODB_TABLE_NAME ||
        RequiredVar("AWS_DYNAMODB_TABLE_NAME"),
    jwksUri: process.env.JWKS_URI || RequiredVar("JWKS_URI"),
};
