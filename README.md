![Banner image](https://user-images.githubusercontent.com/10284570/173569848-c624317f-42b1-45a6-ab09-f0ea3c247648.png)

# n8n-nodes-teamwork-projects

This is an n8n community node. It lets you use the teamwork projects API in your n8n workflows.

Teamwork projects is a project management application which allows you to easily manage your projects.

[n8n](https://n8n.io/) is a [fair-code licensed](https://docs.n8n.io/reference/license/) workflow automation platform.

## Installation

Follow the [installation guide](https://docs.n8n.io/integrations/community-nodes/installation/) in the n8n community nodes documentation.

## Operations

The API docs were scraped to add all functionality of the v3 api.
Some of the operations do not exist in the v3 api, for this the v1 api was added. 
v1 is not configured, so endppoints and fields etc. need to be entered manually. This can also be done with the HTTP node but this simplifies it a little bit.

## Credentials

With Teamwork you can easily authenticate with a personal API token. Everything you have access to will be accessible through the API.

![apiToken](https://github.com/bramkn/n8n-nodes-teamwork-projects/blob/master/images/apiToken.png)

## Compatibility

This node was developed and tested with n8n version 0.194.0

## Usage

The v3 API portion should be used for all operations except the ones that are not available in v3 yet. For these a custom v1 API call can be made.


## Resources

* [n8n community nodes documentation](https://docs.n8n.io/integrations/community-nodes/)
* [teamwork projects v1 API](https://apidocs.teamwork.com/docs/teamwork/47ba196e8ba20-teamwork-api-v1)
* [teamwork projects v3 API](https://apidocs.teamwork.com/docs/teamwork/1686380931896-teamwork-api-v3)

## Version history

v1. first version with basic functionality

