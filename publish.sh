#!/bin/bash
set -e
echo "Publishing all @barzkit plugins..."
for dir in */; do
  if [ -f "$dir/package.json" ] && [ "$dir" != "node_modules/" ]; then
    name=$(node -e "console.log(require('./$dir/package.json').name)")
    echo "Publishing $name..."
    cd "$dir"
    npm run build
    npm test
    npm publish --access public
    cd ..
    echo "✅ $name published"
  fi
done
echo "🎉 All plugins published"
