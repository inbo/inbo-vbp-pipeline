function RequiredVar(name: string): never {
    throw new Error(`${name} is not defined`);
}

export default {
    solrBaseUrl: process.env.SOLR_BASE_URL || RequiredVar("SOLR_BASE_URL"),
    openIdIssuerUrl: process.env.OPEN_ID_ISSUER_URL ||
        RequiredVar("OPEN_ID_ISSUER_URL"),
};
