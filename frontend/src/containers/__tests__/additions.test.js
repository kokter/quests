import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import Additions from "../additions";
import { OrderProvider } from "../../context/order-context";

const renderAdditions = () =>
  render(
    <OrderProvider>
      <MemoryRouter initialEntries={["/mystery"]}>
        <Routes>
          <Route path="/:urlName" element={<Additions />} />
        </Routes>
      </MemoryRouter>
    </OrderProvider>
  );

const openAccordion = () => {
  fireEvent.click(
    screen.getByRole("button", { name: /Дополнительные услуги/i })
  );
};

describe("Additions container", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("renders fetched cards and toggles selection state", async () => {
    const mockFetch = jest.spyOn(global, "fetch").mockResolvedValue({
      ok: true,
      json: async () => [
        { id: 1, name: "Фотосъемка", cost: 500, image: null },
        { id: 2, name: "Аниматор", cost: 900, image: null },
      ],
    });

    renderAdditions();
    openAccordion();

    await waitFor(() =>
      expect(
        screen.getByText(/Фотосъемка/i)
      ).toBeInTheDocument()
    );

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining("/service/addition/?service_url=mystery"),
      expect.objectContaining({
        headers: { Accept: "application/json" },
      })
    );

    const toggleButtons = screen.getAllByRole("button", { name: "Добавить" });
    fireEvent.click(toggleButtons[0]);

    await waitFor(() =>
      expect(toggleButtons[0]).toHaveTextContent("Добавлено")
    );
    expect(toggleButtons[0]).toHaveAttribute("aria-pressed", "true");
  });

  it("shows an error message when the API request fails", async () => {
    jest
      .spyOn(global, "fetch")
      .mockRejectedValueOnce(new Error("network down"));

    renderAdditions();
    openAccordion();

    const error = await screen.findByText(/network down/i);
    expect(error).toBeInTheDocument();
  });
});
