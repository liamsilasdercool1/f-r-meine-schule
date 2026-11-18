// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro/vite builds from this").
    server: { entry: "server" },
    spa: { enabled: true },
  },
  // Use Nitro's Netlify adapter so the server bundle is emitted as Netlify Functions
  // instead of the default Cloudflare/Node output expected by the previous config.
  nitro: {
    preset: "netlify",
  },
});
