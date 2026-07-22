import { test, expect } from "@playwright/test";
import { faker } from '@faker-js/faker';

const testUser = {
    username: "test_"+faker.internet.username(),
    email: faker.internet.email(),
    password: faker.internet.password({ prefix: "Pa$$w0rd_" })
}

test("click login button", async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: "Se connecter" }).click();
    
    await expect(page).toHaveURL("/login");
    await expect(page.getByRole('heading', { name: 'Se connecter' })).toBeVisible();
})

test("show error if wrong credentials", async ({ page }) => {
    await page.goto('/login');

    await page.route('**/api/auth/login', async (route) => {
        await route.fulfill({
            status: 401,
            contentType: 'application/json',
            body: JSON.stringify({ message: "Identifiants invalides"}),
        });
    });

    await page
        .getByLabel(/email/i)
        .fill(testUser.username);

    await page
        .getByLabel("Mot de passe")
        .fill("12345678");

    await page
        .getByRole("button", {
        name: /se connecter/i
        })
        .click();
    
    await expect(page.getByText("Identifiants invalides")).toBeVisible();
    await expect(page).toHaveURL("/login");
})

test("login and redirect to home page", async ({ page }) => {

    await page.route('**/api/auth/login', async (route) => {
        await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify(testUser),
        });
    });

    await page.route('**/api/posts', async (route) => {
        await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify([]),
        });
    });

    await page.goto('/login');

    await page
        .getByLabel(/email/i)
        .fill(testUser.username);

    await page
        .getByLabel("Mot de passe")
        .fill(testUser.password);

    await page
        .getByRole("button", {
        name: /se connecter/i
        })
        .click();
    
    await expect(page).toHaveURL("/home");
    await expect(page.getByText("Aucun article pour le moment")).toBeVisible();
})

test("logout and redirect to landing page", async ({ page }) => {
    await page.addInitScript((userArg) => {
        window.localStorage.setItem('token', userArg.token);
        window.localStorage.setItem('user', JSON.stringify(userArg));
    }, testUser);

    await page.route('**/api/posts', async (route) => {
        await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify([]),
        });
    });

    await page.goto('/home');
    await expect(page.getByText("Se déconnecter")).toBeVisible();

    await page.getByText("Se déconnecter").click();

    await expect(page).toHaveURL("/");
});
