# github-stats

# setup

Duplicate or rename the `config-sample.js` file it to `config.js`  
Fill in your github access token with the desired privileges.  
-> [Generate token](https://github.com/settings/tokens)

Duplicate or rename the `custom-ignores-sample.js` file to `custom-ignores.js`  
Delete the default values and fill in your values, leave the array empty if you want to keep the default configuration

The script needs access to all repos that should be included in the stats (see sidenote below).  

# Sidenote
The script is **not** going to use commits for the calculations that you made to repos you lost access to or were deleted!

### ❗️ Disclaimer
> [!WARNING]
> The script uses the github API  
> I do **NOT** take responsibility for rate blockings or other consequences github may take because of the caused api traffic.