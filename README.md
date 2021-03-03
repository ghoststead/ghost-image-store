# ghost-image-store
Ghost storage adapter that automatically creates a webp version of your uploaded images.

## Installation
```shell
npm install ghost-image-store
mkdir -p ./content/adapters/storage
cp -r ./node_modules/ghost-image-store ./content/adapters/storage/image-store
```

## Configuration
```json
{
    "storage": {
        "active": "image-store",
        "image-store": {
            "webpQuality": 80
        }
    }
}
```
