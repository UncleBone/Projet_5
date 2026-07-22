import { test, expect } from "@playwright/test";
import { faker } from '@faker-js/faker';

const testUser = {
    username: "test_"+faker.internet.username(),
    email: faker.internet.email(),
    password: faker.internet.password({ prefix: "Pa$$w0rd_" })
}

test("landing page show login and register buttons", async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('link', { name: 'Se connecter' })).toBeVisible();
    await expect(page.getByRole('link', { name: "S'inscrire" })).toBeVisible();
})

test("click register button", async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: "S'inscrire" }).click();
    
    await expect(page).toHaveURL("/register");
    await expect(page.getByRole('heading', { name: 'Inscription' })).toBeVisible();
})

test("show error if wrong format", async ({ page }) => {
    await page.goto('/register');

    await page
        .getByLabel(/nom d'utilisateur/i)
        .fill(testUser.username);

    await page
        .getByLabel(/email/i)
        .fill(testUser.email);

    await page
        .getByLabel("Password")
        .fill("12345678");

    await page
        .getByRole("button", {
        name: /s'inscrire/i
        })
        .click();
    
    await expect(page.getByText("Le mot de passe doit contenir au moins une lettre minuscule")).toBeVisible();
})

test("register and redirect to home page", async ({ page }) => {
    await page.goto('/register');

    await page.route('**/api/auth/register', async (route) => {
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

    await page
        .getByLabel(/nom d'utilisateur/i)
        .fill(testUser.username);

    await page
        .getByLabel(/email/i)
        .fill(testUser.email);

    await page
        .getByLabel("Password")
        .fill(testUser.password);

    await page
        .getByRole("button", {
        name: /s'inscrire/i
        })
        .click();
    
    await expect(page).toHaveURL("/home");
    await expect(page.getByText("Aucun article pour le moment")).toBeVisible();
})
