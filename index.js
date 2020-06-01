require("dotenv").config
const core = require("@actions/core");
const axios = require('axios');

const {
    GITHUB_REPOSITORY: repo,
    GITHUB_REF: branch,
} = process.env;

(async () => {
    try {
      const token = core.getInput("token");
      if(!token){
        return core.setFailed('Missing CircleCI token');
      };
      const orgInput = core.getInput("org");
      const repoInput = core.getInput("repo");
      const branchInput = core.getInput("branch");

      const repoName = orgInput && repoInput? `${orgInput}/${repoInput}` : repo;
      const branchName = branchInput || (branch && branch.split('/').pop());
  
      console.log(`Triggering CircleCi job ${repoName} - ${branchName}`)
      const res = await postCircleciAction({
        token,
        repoName,
        branchName,
      });

      console.log(`Job ${res.statusText}`);
      console.log(`Build Number ${res.data.build_num}`);
      console.log(`Build URL ${res.data.build_url}`);

    } catch (error) {
      if(error.response.data && error.response.data.message){
        core.setFailed(error.response.data.message);
      }else{
        core.setFailed(error.message);
      }
    }
  })();
  
  async function postCircleciAction({ token, repoName, branchName }) {
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Circle-Token': token
      },
      data: {"branch": branchName},
      url: `https://circleci.com/api/v2/project/github/${repoName}/pipeline`,
    };
    return await axios(options);
  }
