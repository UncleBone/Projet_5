import { test, expect } from "@playwright/test";
import { faker } from '@faker-js/faker';

const testUser = {
    username: "test_"+faker.internet.username(),
    email: faker.internet.email(),
    password: faker.internet.password({ prefix: "Pa$$w0rd_" }),
    token: faker.internet.jwt()
}
const fakePosts = [
    { id: 1, title: faker.lorem.word(), text: faker.lorem.paragraphs(), date: faker.date.past(), 
        users: { username: faker.internet.username() }, topics: { name: faker.lorem.word() }, comments: [] },
    { id: 2, title: faker.lorem.word(), text: faker.lorem.paragraphs(), date: faker.date.past(), users: { username: faker.internet.username() }},
    { id: 3, title: faker.lorem.word(), text: faker.lorem.paragraphs(), date: faker.date.past(), users: { username: faker.internet.username() }},
    { id: 4, title: faker.lorem.word(), text: faker.lorem.paragraphs(), date: faker.date.past(), users: { username: faker.internet.username() }},
]
const newComment = {
    id: 1, text: faker.lorem.paragraph(), users: { username: testUser.username }
}

test.beforeEach(async ({ page }) => {
  await page.addInitScript(( userArg ) => {
    window.localStorage.setItem('token', userArg.token);
    window.localStorage.setItem('user', JSON.stringify(userArg));
  }, testUser);
});

test("home page", async ({ page }) => {
    const sortedTitles = [...fakePosts]
        .sort((a, b) => b.date.getTime() - a.date.getTime())
        .map(post => post.title);
    const reverseSortedTitles = [...fakePosts]
        .sort((a, b) => a.date.getTime() - b.date.getTime())
        .map(post => post.title);

    await page.route('**/api/posts', async (route) => {
        await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify(fakePosts),
        });
    });
    await page.goto('/home');

    await expect(page.getByTestId('post-title')).toHaveText(sortedTitles, { ignoreCase: true });

    await page.getByLabel(/Trier/i).selectOption('asc');
    await expect(page.getByTestId('post-title')).toHaveText(reverseSortedTitles, { ignoreCase: true });
})

test("post detail", async ({ page }) => {
    await page.route('**/api/posts', async (route) => {
        await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify(fakePosts),
        });
    });
   
    await page.goto('/home');
    await page.getByRole('heading', { name: fakePosts[0].title, ignoreCase: true }).locator('..').click()

    await page.route('**/api/posts/'+fakePosts[0].id, async (route) => {
        await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify(fakePosts[0]),
        });
    });
    await expect(page).toHaveURL("/home/"+fakePosts[0].id);
    await expect(page.getByRole('heading', { name: fakePosts[0].title, ignoreCase: true })).toBeVisible();
    await expect(page.getByText(fakePosts[0].text)).toBeVisible();
})

test("add comment", async ({ page }) => {
    await page.route('**/api/posts/'+fakePosts[0].id, async (route) => {
        await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify(fakePosts[0]),
        });
    });
    await page.goto('/home/'+fakePosts[0].id);

    await page.route('**/api/posts/'+fakePosts[0].id+'/comment', async (route) => {
        await route.fulfill({
            status: 201,
            contentType: 'application/json'
        });
    });
    await page.route('**/api/posts/'+fakePosts[0].id, async (route) => {
        await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({...fakePosts[0], comments: [newComment]}),
        });
    });

    await page
        .getByTestId("comment_input")
        .fill(newComment.text);
    await page.getByAltText("send").click();

    await expect(page.getByText(newComment.text)).toBeVisible();
})