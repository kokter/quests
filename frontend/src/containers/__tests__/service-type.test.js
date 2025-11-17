import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import ServiceType from "../service-type";

describe("ServiceType card", () => {
  it("renders provided props and links to the service details", () => {
    window.innerWidth = 1280;

    render(
      <MemoryRouter>
        <ServiceType
          image="https://example.com/image.jpg"
          title="Лазертаг"
          maxParticipants={6}
          ageRange="12+"
          description="Погружение в городские легенды"
          cost="3000"
          urlName="laser-tag"
        />
      </MemoryRouter>
    );

    const link = screen.getByRole("link");
    expect(link.getAttribute("href")).toBe("/laser-tag");

    expect(
      screen.getByRole("heading", { name: "Лазертаг", level: 3 })
    ).toBeInTheDocument();
    expect(screen.getByText("До 6")).toBeInTheDocument();
    expect(screen.getByText("(12+)")).toBeInTheDocument();
    expect(
      screen.getByText(/Погружение в городские легенды/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/3000/)).toBeInTheDocument();
    expect(screen.getByAltText("Лазертаг")).toHaveAttribute(
      "src",
      "https://example.com/image.jpg"
    );
  });

  it("falls back to a placeholder URL when the slug is missing", () => {
    render(
      <MemoryRouter>
        <ServiceType title="Без ссылки" />
      </MemoryRouter>
    );

    expect(screen.getByRole("link").getAttribute("href")).toBe("#");
  });
});
