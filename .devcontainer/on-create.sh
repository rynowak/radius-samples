#!/bin/sh

## Create a k3d cluster
k3d cluster delete
k3d cluster create -p '8081:80@loadbalancer' --k3s-arg '--disable=traefik@server:0'

## Install Dapr and init
wget -q https://raw.githubusercontent.com/dapr/cli/master/install/install.sh -O - | /bin/bash
dapr uninstall # clean if needed
dapr init -k

## Install rad CLI
CURRENT_BRANCH=$(git branch --show-current)

if [ "$CURRENT_BRANCH" = "edge" ]; then
    RADIUS_VERSION=edge
else
    ## If CURRENT_BRANCH matches a regex of the form "v0.20", set RADIUS_VERSION to the matching string minus the "v"
    if [[ "$CURRENT_BRANCH" =~ ^v[0-9]+\.[0-9]+$ ]]; then
        RADIUS_VERSION=${CURRENT_BRANCH:1}
    else
        ## Otherwise, set RADIUS_VERSION to "edge"
        RADIUS_VERSION=edge
    fi
fi

if [ "$RADIUS_VERSION" = "edge" ]; then
    wget -q "https://get.radapp.dev/tools/rad/install.sh" -O - | /bin/bash -s edge
else
    wget -q "https://get.radapp.dev/tools/rad/install.sh" -O - | /bin/bash
fi

## Download Bicep extension
curl https://get.radapp.dev/tools/vscode-extensibility/$RADIUS_VERSION/rad-vscode-bicep.vsix --output /tmp/rad-vscode-bicep.vsix
