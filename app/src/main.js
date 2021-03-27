import App from './App.svelte';

const app = new App({
	target: document.body,
	props: {
    favorites: ["math:geometry", "sport:football"],
    channels: ["math", "physics", "france", "sport"],
	}
});

export default app;
