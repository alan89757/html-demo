const baseBranch = "${{ env.BRANCH_NAME }}";
const headBranch = "main";
const title = `Merge main into ${baseBranch}`;
const body =
  "This PR is automatically created to merge latest changes from main into feature branch.";

// Check if PR already exists
const existingPrs = await github.rest.pulls.list({
  owner: context.repo.owner,
  repo: context.repo.repo,
  head: `${context.repo.owner}:${headBranch}`,
  base: baseBranch,
  state: "open",
});

if (existingPrs.data.length === 0) {
  // Create new PR
  await github.rest.pulls.create({
    owner: context.repo.owner,
    repo: context.repo.repo,
    title: title,
    body: body,
    head: headBranch,
    base: baseBranch,
  });
  console.log(`Created PR: ${title}`);
} else {
  console.log(`PR already exists: ${existingPrs.data[0].html_url}`);
  // Try to merge the PR if possible
  if (existingPrs.data[0].mergeable) {
    await github.rest.pulls.merge({
      owner: context.repo.owner,
      repo: context.repo.repo,
      pull_number: existingPrs.data[0].number,
      merge_method: "squash",
    });
    console.log(`Successfully merged PR: ${existingPrs.data[0].html_url}`);
  } else {
    console.log(
      `PR ${existingPrs.data[0].html_url} is not mergeable (has conflicts)`
    );
  }
}
