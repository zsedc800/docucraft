const nextConfig = {
	webpack(config) {
		console.log(config, 'webpack');

		return config;
	}
};

export default nextConfig;
