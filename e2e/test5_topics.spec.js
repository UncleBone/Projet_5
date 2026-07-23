import { test, expect } from "@playwright/test";
import { faker } from '@faker-js/faker';

const testUser = {
    username: "test_"+faker.internet.username(),
    email: faker.internet.email(),
    password: faker.internet.password({ prefix: "Pa$$w0rd_" }),
    token: faker.internet.jwt()
}
const fakeTopics = [
    { id: 1, name: faker.lorem.word(), description: faker.lorem.paragraph() },
    { id: 2, name: faker.lorem.word(), description: faker.lorem.paragraph() },
    { id: 3, name: faker.lorem.word(), description: faker.lorem.paragraph() },
    { id: 4, name: faker.lorem.word(), description: faker.lorem.paragraph() },
]

test.beforeEach(async ({ page }) => {
  await page.addInitScript(( userArg ) => {
    window.localStorage.setItem('token', userArg.token);
    window.localStorage.setItem('user', JSON.stringify(userArg));
  }, testUser);
});

test("topics link", async ({ page }) => {
    await page.route('**/api/posts', async (route) => {
        await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify([]),
        });
    });
    await page.goto('/home');

    await expect(page.getByText("Thèmes")).toBeVisible();

    await page.route('**/api/topics', async (route) => {
        await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify(fakeTopics),
        });
    });
    await page.route('**/api/user/subscriptions', async (route) => {
        await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify([]),
        });
    });

    await page.getByText("Thèmes").click()

    await expect(page).toHaveURL('/topics');
    for(let topic of fakeTopics){
        await expect(page.getByRole('heading', { name: topic.name, ignoreCase: true })).toBeVisible();
        await expect(page.getByText(topic.description)).toBeVisible();
    }
})

test("subscribe buttons", async ({ page }) => {
    await page.route('**/api/topics', async (route) => {
        await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify(fakeTopics),
        });
    });
    await page.route('**/api/user/subscriptions', async (route) => {
        await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify([]),
        });
    });

    await page.goto('/topics');

    let subscriptions = [];

    for(let topic of fakeTopics){
        await expect(page.getByRole('heading', { name: topic.name, ignoreCase: true })).toBeVisible();
        const button = page.getByRole('heading', { name: topic.name, ignoreCase: true }).locator('..').getByRole('button');
        await expect(button).toHaveText(/s'abonner/i);
        subscriptions.push({ t_id: topic.id });
        await page.route('**/api/user/subscriptions/'+topic.id, async (route) => {
            await route.fulfill({
                status: 200,
            });
        });
        await page.route('**/api/user/subscriptions', async (route) => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify(subscriptions),
            });
        });
        await button.click();
        await expect(button).toHaveText(/déjà abonné/i);
    }
})
