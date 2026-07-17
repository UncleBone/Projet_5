import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import NotFound from "./not-found";
import '@testing-library/jest-dom';

describe("NotFound component", () => {
  it("affiche le code d'erreur 404", () => {
    render(<NotFound />);
    const errorCode = screen.getByText("404");
    expect(errorCode).toBeInTheDocument();
    expect(errorCode).toHaveClass("text-8xl", "font-bold", "text-primary");
  });

  it("affiche les messages d'erreur et explications", () => {
    render(<NotFound />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Page introuvable");
    expect(screen.getByText(/la page que vous recherchez n'existe pas ou a été déplacée/i)).toBeInTheDocument();
  });

  it("contient un lien vers la page d'accueil avec les bonnes propriétés", () => {
    render(<NotFound />);
    const homeLink = screen.getByRole("link", { name: /retour à l'accueil/i });
    expect(homeLink).toBeInTheDocument();
    expect(homeLink).toHaveAttribute("href", "/");
    expect(homeLink).toHaveClass(
      "bg-primary",
      "text-primary-foreground",
      "rounded-lg",
      "inline-flex",
      "items-center",
      "justify-center",
      "px-6",
      "py-3"
    );
  });
});