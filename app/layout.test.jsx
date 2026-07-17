import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import RootLayout from "./layout";
import Navigation from "../components/navigation";
import '@testing-library/jest-dom';

// Pour éviter d’avoir des erreurs avec le composant Navigation, on peut le mocker
vi.mock("../components/navigation", () => ({
  default: () => <nav data-testid="navigation">Navigation</nav>,
}));

vi.mock("next/font/google", () => ({
  Geist: () => ({ variable: "--font-geist-sans" }),
  Geist_Mono: () => ({ variable: "--font-geist-mono" }),
}));

describe("RootLayout component", () => {
  it("rend les éléments html de base avec la langue française", () => {
    render(
      <RootLayout>
        <div data-testid="children">Contenu enfant</div>
      </RootLayout>
    );
    const html = document.documentElement;
    expect(html).toHaveAttribute("lang", "fr");
    expect(screen.getByTestId("children")).toBeInTheDocument();
  });

  it("applique bien les classes de font sur le body", () => {
    render(
      <RootLayout>
        <div>Test content</div>
      </RootLayout>
    );
    const body = document.body;
    // Les variables css des fonts sont dynamiques, vérifier leur présence dans className body
    expect(body.className).toMatch(/--font-geist-sans/);
    expect(body.className).toMatch(/--font-geist-mono/);
    expect(body.className).toContain("antialiased");
  });

  it("intègre le composant Navigation", () => {
    render(
      <RootLayout>
        <></>
      </RootLayout>
    );
    expect(screen.getByTestId("navigation")).toBeInTheDocument();
  });
});