module.exports = ({ config }) => {
    return {
        ...config,
        extra: {
            ...config.extra,  // include any existing extra properties
            API_URL: "https://4gkntp89fl.execute-api.eu-central-1.amazonaws.com/development/",
            reputationSCAddress: "0x0000000000000",
            parcelNFTSCAddress: "0x0000000000000",
            RPCUrl: "https://bellecour.iex.ec",
            use_demo_device: true,
        },
    };
};