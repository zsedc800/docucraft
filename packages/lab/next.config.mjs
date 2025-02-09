const nextConfig = {
	webpack(config) {
		console.log(config, 'parser');

		return config;
	}
};

export default nextConfig;
