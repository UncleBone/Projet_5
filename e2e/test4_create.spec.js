import { test, expect } from "@playwright/test";
import { faker } from '@faker-js/faker';

const testUser = {
    username: "test_"+faker.internet.username(),
    email: faker.internet.email(),
    password: faker.internet.password({ prefix: "Pa$$w0rd_" }),
    token: faker.internet.jwt()
}
const fakePost = { title: faker.lorem.word(), text: faker.lorem.paragraphs() };
const fakeTopics = [
    { id: 1, name: faker.lorem.word() },
    { id: 2, name: faker.lorem.word() },
    { id: 3, name: faker.lorem.word() },
    { id: 4, name: faker.lorem.word() },
]

test.beforeEach(async ({ page }) => {
  await page.addInitScript(( userArg ) => {
    window.localStorage.setItem('token', userArg.token);
    window.localStorage.setItem('user', JSON.stringify(userArg));
  }, testUser);
});

test("home create button", async ({ page }) => {
    await page.route('**/api/posts', async (route) => {
        await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify([]),
        });
    });
    await page.goto('/home');

    await expect(page.getByRole('button', { name: "Créer un article"})).toBeVisible();
    
    await page.getByRole('button', { name: "Créer un article"}).click();

    await expect(page).toHaveURL("/home/create");
    await expect(page.getByRole('heading', { name: "Créer un nouvel article"})).toBeVisible();
})

test("create new post", async ({ page }) => {
    await page.route('**/api/topics', async (route) => {
        await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify(fakeTopics),
        });
    });
    await page.goto('/home/create');

    await page.getByTestId('select_topic').selectOption('2');
    await page.getByPlaceholder("Titre de l'article").fill(fakePost.title);
    await page.getByPlaceholder("Contenu de l'article").fill(fakePost.text);

    await page.route('**/api/posts', async (route) => {
        await route.fulfill({
            status: 201,
        });
    });
    await page.getByRole("button", { name: "Créer" }).click();

    await expect(page.getByText(/article créé/i)).toBeVisible();
})
