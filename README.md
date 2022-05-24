## Description

Creates Trustpilot Summary integration for your gatsby website. This source plugin fetches data from Trustpilot API and 
makes it available through GraphQL nodes. The generated Query nodes can be viewed using gatsby's GraphQL
editor. This plugin just fetches the [public business unit information](https://developers.trustpilot.com/business-units-api-(public)#get-public-business-unit) from Trustpilot.
Originally the author added Summary AND individual review data but that was not needed and depending on company size and the number of Trustpilot reviews can grow the page-data.json.

## How to integrate it with Gatsby?
1. install the plugin `npm install gatsby-source-trustpilot-summary`
2. configure the plugin in your `gatsby-config.js` file
 ```
    module.exports = {
        siteMetadata: {
            title: 'Title of your website'
        },
        plugins: [
            {
                resolve: 'gatsby-source-trustpilot-summary',
                options: {
                apiKey: '<API Key>',
                secretKey: '<Secret>',
                domains: [
                    'domain.com' // An array of website URLs to pull the reviews for
                ]
            }
        },
      ]
    };
```

## Config Options
The plugin takes three REQUIRED config options,
1. `apiKey` : This is your Trustpilot API key. If you dont have one yet, here is a link - [Get Started - Trustpilot API](https://support.trustpilot.com/hc/en-us/articles/207309867-Getting-started-with-Trustpilot-s-APIs)
2. `secretKey`: This is your Trustpilot Secret.  This allows the client to connect.
3. `domains`: This is an array of the domain names that you want to fetch TrustPilot Data for. 

## How to query for data?
If all goes well, you should be able to access nodes created by the plugin in your site's GraphiQL editor.
For example: 
```
{
    trustPilotSummary {
        unitId
        displayName
        websiteUrl
        score {
            stars
            trustScore
        }
        numberOfReviews {
            fiveStars
            fourStars
            total
        }
    }
}
```

Multiple domains
```
{
    allTrustPilotSummary {
        nodes {
            unitId
            displayName
            websiteUrl
            country
            status
            score {
                trustScore
                stars
            }
            numberOfReviews {
                total
                fiveStars
                fourStars
            }
        }
    }
}
```