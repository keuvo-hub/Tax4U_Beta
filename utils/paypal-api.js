const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const Env_variables = require('../models/env_variable');

// for verify payment , calling that order 
async function getOrderDetails(orderId) {
    const envFileData = await Env_variables.findOne({});
    const accessToken = await generateAccessToken();
    const url = `${envFileData?.paypal_base_url}/v2/checkout/orders/${orderId}`;
    const response = await fetch(url, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
        },
    });
    return handleResponse(response);
}

// generate access token
async function generateAccessToken() {
    const envFileData = await Env_variables.findOne({});
    const auth = Buffer.from(envFileData?.paypal_client_id + ":" + envFileData?.paypal_secret_key).toString("base64");
    const response = await fetch(`${envFileData?.paypal_base_url}/v1/oauth2/token`, {
        method: "post",
        body: "grant_type=client_credentials",
        headers: {
            Authorization: `Basic ${auth}`,
        },
    });
    const jsonData = await handleResponse(response);
    return jsonData.access_token;
}


async function handleResponse(response) {
    if (response.status === 200 || response.status === 201) {
        return response.json();
    }
    const errorMessage = await response.text();
    throw new Error(errorMessage);
}

module.exports = {
    handleResponse, generateAccessToken, getOrderDetails
}