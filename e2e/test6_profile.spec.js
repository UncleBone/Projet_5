import { test, expect } from "@playwright/test";
import { faker } from '@faker-js/faker';

const testUser = {
    username: "test_"+faker.internet.username(),
    email: faker.internet.email(),
    password: faker.internet.password({ prefix: "Pa$$w0rd_" }),
    token: faker.internet.jwt()
}
const fakeUpdate = {
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

test("profile link", async ({ page }) => {
    await page.route('**/api/posts', async (route) => {
        await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify([]),
        });
    });
    await page.goto('/home');

    await expect(page.getByAltText("profil")).toBeVisible();

    await page.route('**/api/user/subscriptions', async (route) => {
        await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify(fakeTopics),
        });
    });

    await page.getByAltText("profil").click()

    await expect(page).toHaveURL('/profile');
    await expect(page.getByRole('heading', { name: /profil utilisateur/i })).toBeVisible();
})

test("update profile", async ({ page }) => {
    await page.route('**/api/user/subscriptions', async (route) => {
        await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify(fakeTopics),
        });
    });
    await page.goto('/profile');

    await page
        .locator("#username_input")
        .fill(fakeUpdate.username);
    await page
        .locator("#email_input")
        .fill(fakeUpdate.email);
    await page
        .locator("#password_input")
        .fill(fakeUpdate.password);
    
    await page.route('**/api/user', async (route) => {
        await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify(fakeUpdate),
        });
    });

    await page.getByRole("button", { name: /sauvegarder/i }).click();

    await expect(page.getByText(/Mise à jour réussie/i)).toBeVisible();
})

test("unsubscribe", async ({ page }) => {
    await page.route('**/api/user/subscriptions', async (route) => {
        await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify(fakeTopics),
        });
    });
    await page.goto('/profile');

    for(let topic of fakeTopics){
        await expect(page.getByText(topic.name, { exact: false })).toBeVisible();
        await expect(page.getByText(topic.description, { exact: false })).toBeVisible();
    }

    for(let topic of fakeTopics){
        const button = page.getByRole('heading', { name: topic.name, ignoreCase: true }).locator('..').getByRole('button');
        await page.route('**/api/user/subscriptions/'+topic.id, async (route) => {
            await route.fulfill({
                status: 200,
            });
        });
        await button.click();
        await expect(page.getByText(topic.name)).not.toBeVisible();
    }

})

