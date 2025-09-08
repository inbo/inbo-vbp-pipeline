function RequiredVar(name: string): never {
    throw new Error(`${name} is not defined`);
}

export default {
    solrBaseUrl: process.env.SOLR_BASE_URL || RequiredVar("SOLR_BASE_URL"),
    jwksUri: process.env.JWKS_URI || RequiredVar("JWKS_URI"),
};
