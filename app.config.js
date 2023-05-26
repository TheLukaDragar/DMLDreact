module.exports = ({ config }) => {
    return {
        ...config,
        extra: {
            ...config.extra,  // include any existing extra properties
            API_URL: "https://4gkntp89fl.execute-api.eu-central-1.amazonaws.com/development/",
            reputationSCAddress: "0x883957F3bc621DEc82d4522379E67bA4a8118820",
            parcelNFTSCAddress: "0xDD2EBb698bfCcD711E3Cc352a9E3C17b484fB339",
            RPCUrl: "https://bellecour.iex.ec",
            use_demo_device: true,
        },
    };
};