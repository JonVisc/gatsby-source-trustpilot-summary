const { TrustpilotApi } = require('trustpilot')
const ConfigException = require('./config-exception')

class TrustPilotFetch {
    constructor({apiKey, secretKey, domains}) {
        if (!apiKey || apiKey === '') {
            throw new ConfigException('Trustpilot API Key missing. Make sure to provide an API key in the config')
        }

        if (!secretKey || secretKey === '') {
            throw new ConfigException('Trustpilot Secret Key missing. Make sure to provide a Secret Key in the config')
        }

        if (!domains || !Array.isArray(domains) || domains.length === 0) {
            throw new ConfigException('You need to provide at least one domain in your gatsby config. Please refer to gatsby-source-trustpilot documentation')
        }

        this.apiKey = apiKey
        this.secretKey = secretKey
        this.domains = domains
        this.unitIds = []

        this.client = new TrustpilotApi({
            key: apiKey,
            secret: secretKey,
        })
    }

    async fetchUnitIdsForDomains() {
        // Map domain names with Unit IDs
        const unitPromises = await this.domains.map(async domain => {
            const res = await this.client.apiRequest(
                `https://api.trustpilot.com/v1/business-units/find?apikey=${this.apiKey}&name=${domain}`
            )

            if (!res || !res.id) {
                throw new ConfigException(`Business Unit ID not found for domain: ${domain}`)
            }

            this.unitIds.push({
                domain,
                unitId: res.id,
            })

            return res
        })

        await Promise.all(unitPromises)
    }

    async getSummary() {
        let results = []

        for (let unit of this.unitIds) {
            let result = await this.client.apiRequest(
                `https://api.trustpilot.com/v1/business-units/${unit.unitId}`,
            )

            result.unitId = unit.unitId
            results.push(result)
        }

        return results
    }

    createQueryString(params) {
        return Object.keys(params).map(k =>
            `${encodeURIComponent(k)}=${encodeURIComponent(params[k])}`
        ).join('&')
    }

    async getRecentReviews(params) {
        let results = []
        const queryString = this.createQueryString(params)

        //console.log('Query string:', { queryString, params })
        
        for (let unit of this.unitIds) {
            console.log(`https://api.trustpilot.com/v1/business-units/${unit.unitId}/reviews?${queryString}&apikey=${this.apiKey}`)
            let result = await this.getReviews(
                `https://api.trustpilot.com/v1/business-units/${unit.unitId}/reviews?${queryString}&apikey=${this.apiKey}`,
            )

            result.unitId = unit.unitId
            results.push(result)
        }

        return results
    }

    async getReviews(uri) {
        //console.log(uri)
        let fragment = await this.client.apiRequest(uri)
        let nextPage = fragment.links.find(function (link) {
            return link.rel === 'next-page'
        })

        if (nextPage) {
            fragment.reviews = fragment.reviews.concat((
                await this.getReviews(`${nextPage.href.replace(this.client.baseUrl, '')}&apikey=${this.apiKey}`)
            ).reviews)
        }

        return fragment
    }
}

exports.TrustPilotFetch = TrustPilotFetch
