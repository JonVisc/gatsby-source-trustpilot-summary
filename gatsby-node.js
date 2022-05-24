const TPFetch = require('./trustpilot-fetch')

exports.onPreInit = () => console.log('Loaded: gatsby-source-trustpilot')

exports.sourceNodes = async ({ actions, createNodeId, createContentDigest }, {
    apiKey,
    secretKey,
    domains,
}) => {
    const { createNode } = actions
    const client = new TPFetch.TrustPilotFetch({
        apiKey,
        secretKey,
        domains,
    })

    logInfo('Connecting to the Trustpilot API...')

    // Get Business Unit IDs for given domains
    await client.fetchUnitIdsForDomains()

    if (client.unitIds.length > 0) {
        logSuccess(`Fetched Business Unit IDs for ${client.unitIds.length} domains`)
    } else {
        logWarning('No Business Unit IDs found. Have you passed correct domains in config file?')
    }

    const reviewsSummary = await client.getSummary()

    logSuccess(`Fetched ${reviewsSummary.length} summary items`)

    //const recentReviews = await client.getRecentReviews({perPage: 100})

    // Create node for summaries
    for (let summary of reviewsSummary) {
        const currentUnit = client.unitIds.filter(({ unitId }) => unitId === summary.unitId)
        // console.log('SummaryNode1:')
        // console.log(JSON.stringify(summary))
        //console.log(SummaryNode)
        //const summaryNode = SummaryNode(summary)

        //summary.domain = currentUnit[0].domain
        //createNode(summaryNode)
        createNode({
            ...summary,
            id: createNodeId(summary.id),
            internal: {
                type: 'TrustPilotSummary',
                contentDigest: createContentDigest(summary)
            }
        })
    }

    // for (let unitData of recentReviews) {
    //     let reviewsCount = 0

    //     // Get current unit so we can attach the domain to the review
    //     const currentUnit = client.unitIds.filter(({ unitId }) => unitId === unitData.unitId)

    //     // Create nodes for individual reviews
    //     for (let review of unitData.reviews) {
    //         reviewsCount++
    //         review.unitId = unitData.unitId
    //         review.domain = currentUnit[0].domain
    //         //const reviewNodeObject = ReviewNode(review)
    //         //createNode(reviewNodeObject)
    //         createNode({
    //             ...review,
    //             id: createNodeId(review.id),
    //             internal: {
    //                 type: 'TrustPilotReview',
    //                 contentDigest: createContentDigest(review)
    //             }
    //         })
    //     }

    //     logSuccess(`Fetched ${reviewsCount} reviews for ${currentUnit[0].domain} Business Unit ID`)
    // }
}

const logWarning = (text) => {
    console.log(`Warning: gatsby-source-trustpilot - ${text}`)
}

const logError = (text) => {
    console.log(`Error: gatsby-source-trustpilot - ${text}`)
}

const logSuccess = (text) => {
    console.log(`Success: gatsby-source-trustpilot - ${text}`)
}

const logInfo = (text) => {
    console.log(`Info: gatsby-source-trustpilot - ${text}`)
}


/**

// constants for your GraphQL Post and Author types
const POST_NODE_TYPE = `Post`
exports.sourceNodes = async ({
  actions,
  createContentDigest,
  createNodeId,
  getNodesByType,
}) => {
  const { createNode } = actions
  const data = {
    posts: [
      { id: 1, description: `Hello world!` },
      { id: 2, description: `Second post!` },
    ],
  }
  // loop through data and create Gatsby nodes
  data.posts.forEach(post =>
    createNode({
      ...post,
      id: createNodeId(`${POST_NODE_TYPE}-${post.id}`),
      parent: null,
      children: [],
      internal: {
        type: POST_NODE_TYPE,
        content: JSON.stringify(post),
        contentDigest: createContentDigest(post),
      },
    })
  )
  return
}
*/