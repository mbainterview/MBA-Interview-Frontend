#!/usr/bin/env bash
# One-shot script: downloads the 43 arc-fan layers + 1 mask image used by
# <HeroBanner> from Figma's MCP CDN to public/figma-assets/hero-arc/.
# Re-run with fresh UUIDs whenever the Figma source layers change.

set -euo pipefail
DEST="public/figma-assets/hero-arc"
mkdir -p "$DEST"

declare -A ASSETS=(
  [mask.svg]=518b9416-b04c-4f7c-bfc2-0d4ee43e308f
  [layer-01.svg]=b0d1e837-3b00-46ab-835e-b8611ea0a86b
  [layer-02.svg]=b90c28e9-1227-4966-b313-e0f9ffa6ab29
  [layer-03.svg]=827f0c06-b31f-48f8-bc6b-12bb5b40c6d7
  [layer-04.svg]=2bfacfb4-cf2f-4876-be98-b91c8d924845
  [layer-05.svg]=7093efbd-96f0-429c-825c-3c3611a2fef3
  [layer-06.svg]=06f440a8-fc90-463e-b5b0-d21b4985c075
  [layer-07.svg]=a132e98b-ba9e-4473-89b9-06cae4f8979a
  [layer-08.svg]=82537fe4-93f3-4356-83f4-b8a6d8271b62
  [layer-09.svg]=5a756339-6c5f-4022-9b15-fe5c64170f86
  [layer-10.svg]=422d4459-78cf-4199-afca-4481bf64d21c
  [layer-11.svg]=55c7e7ea-dc0c-441c-a772-ee1bb5a52c04
  [layer-12.svg]=92f40f0e-c890-4cd5-b43a-06fdc60c4431
  [layer-13.svg]=d2e62640-b4ff-470e-8dd2-ea9615683316
  [layer-14.svg]=864c744d-4156-4546-bf5f-78c326b2be1c
  [layer-15.svg]=c697d00c-9525-421b-8c31-602bef8c6a2e
  [layer-16.svg]=69067e15-45bb-41d5-88ea-ace462a15307
  [layer-17.svg]=ca444022-4c98-4aeb-8eea-1aa981fcb386
  [layer-18.svg]=ea5b2291-6ef5-48aa-bba0-e95d6d3285e6
  [layer-19.svg]=1354ac1e-0545-4933-ae4a-945279c98f87
  [layer-20.svg]=bd75a45b-495d-4667-8277-26bde8271c1b
  [layer-21.svg]=7def7b48-c210-4092-a92d-3e5127eb9459
  [layer-22.svg]=59b0e8a3-1998-43ad-b254-fe3c6a585f9e
  [layer-23.svg]=a3392cd1-f6cd-42cb-ba25-341c98db41f1
  [layer-24.svg]=9aeeb225-c9f4-41d9-9b58-f7de8543f0f9
  [layer-25.svg]=0911c13d-dca0-4c08-9ffc-c41b971337b6
  [layer-26.svg]=7c0e8b25-a9fa-473d-83b6-94d8ac1b59e7
  [layer-27.svg]=3954ac49-0303-4303-b16f-2b2b7ffff051
  [layer-28.svg]=9f6a16c1-a7e8-45ff-8d52-782aa734ff05
  [layer-29.svg]=a3c7a4e6-38cf-49f7-a7c2-9c9b336b5bec
  [layer-30.svg]=502ad9bd-cdf1-4db1-bc25-19b538719292
  [layer-31.svg]=b0a556eb-8625-4026-b0ae-d0b0357d1362
  [layer-32.svg]=c9d24af8-0ba7-4aca-b8df-16402f5629ca
  [layer-33.svg]=765a10e7-c4a5-4117-89b9-a75f9fefa248
  [layer-34.svg]=801bba1f-2c6c-4155-94dd-60cbc4213e31
  [layer-35.svg]=23710c28-d224-41a0-8355-dae49e0026df
  [layer-36.svg]=120ec316-2e10-4176-9439-1f596d806f39
  [layer-37.svg]=aa73763a-db92-4cf7-b044-fd61f14572a1
  [layer-38.svg]=3acbf048-0dfe-4960-930c-a59ce1f1a3e7
  [layer-39.svg]=e2068748-82ac-46d7-b1a2-08dc842e4c68
  [layer-40.svg]=afe6b9de-41fb-477f-9ced-c9c2cbd266ce
  [layer-41.svg]=1a3be54b-eb18-4edc-8ff9-a97db2eee9de
  [layer-42.svg]=873c9f5d-f0d6-4ffd-a94b-ce8fc0ff8e88
  [layer-43.svg]=21289c09-36b0-48a2-ba05-a73638e20cae
)

count=0
for filename in "${!ASSETS[@]}"; do
  uuid="${ASSETS[$filename]}"
  url="https://www.figma.com/api/mcp/asset/${uuid}"
  out="${DEST}/${filename}"
  curl -sf -o "$out" "$url" && echo "ok  $filename" || echo "FAIL $filename"
  count=$((count + 1))
done

echo "Downloaded $count files to $DEST"
