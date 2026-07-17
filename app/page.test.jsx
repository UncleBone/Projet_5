import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import App from "./page";
import '@testing-library/jest-dom'; // pour les matchers personnalisés

describe("App component", () => {
  it("affiche le logo avec les bonnes propriétés", () => {
    render(<App />);
    const logo = screen.getByAltText("logo MDD");
    expect(logo).toBeInTheDocument();
    // Vérifier la source de l'image
    // Attention : next/image rend une image différente en test, on vérifie plutôt l'attribut "alt"
  });

  it("affiche les liens avec le texte et href attendus", () => {
    render(<App />);
    const loginLink = screen.getByRole("link", { name: /se connecter/i });
    expect(loginLink).toBeInTheDocument();
    expect(loginLink).toHaveAttribute("href", "/login");

    const registerLink = screen.getByRole("link", { name: /s'inscrire/i });
    expect(registerLink).toBeInTheDocument();
    expect(registerLink).toHaveAttribute("href", "/register");
  });

  it("contient les classes CSS pour la mise en forme des boutons", () => {
    render(<App />);

    const loginLink = screen.getByRole("link", { name: /se connecter/i });
    expect(loginLink).toHaveClass("bg-primary", "text-primary-foreground");

    const registerLink = screen.getByRole("link", { name: /s'inscrire/i });
    expect(registerLink).toHaveClass("border-2", "border-primary", "text-primary");
  });
});