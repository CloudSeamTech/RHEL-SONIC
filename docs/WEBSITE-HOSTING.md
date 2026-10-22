# Website hosting

The full Vinext application runs at https://sonic-academy-cloud-seam.vercel.app/ and deploys from main through Vercel. GitHub Pages is configured to publish main:/docs at https://cloudseamtech.github.io/SONIC-Academy/ . Its index.html and 404.html forward visitors to the application, preserving course paths, query strings and lesson hashes. GitHub Pages cannot run the application server by itself.

Keep both entry files synchronized when changing the canonical host. The /docs/.nojekyll marker serves the directory without a separate Jekyll conversion.
