import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { SavingsProgress } from "./savings-progress";

afterEach(cleanup);

describe("<SavingsProgress />", () => {
  it("hiện tên món, phần trăm và số tiền còn thiếu", () => {
    render(<SavingsProgress name="Laptop mới" cost={20_000_000} balance={5_000_000} />);

    expect(screen.getByText("Laptop mới")).toBeInTheDocument();
    expect(screen.getByText("25%")).toBeInTheDocument();
    expect(screen.getByText(/Còn thiếu 15\.000\.000/)).toBeInTheDocument();
  });

  it("thanh tiến độ có role progressbar để trình đọc màn hình đọc được", () => {
    render(<SavingsProgress name="Laptop mới" cost={20_000_000} balance={10_000_000} />);

    const bar = screen.getByRole("progressbar", { name: /Laptop mới/ });
    expect(bar).toHaveAttribute("aria-valuenow", "50");
  });

  it("số dư âm -> 0%", () => {
    render(<SavingsProgress name="Xe máy" cost={30_000_000} balance={-2_000_000} />);

    expect(screen.getByText("0%")).toBeInTheDocument();
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "0");
  });

  it("đủ tiền -> 100% và dòng chúc mừng", () => {
    render(<SavingsProgress name="Tai nghe" cost={1_000_000} balance={5_000_000} />);

    expect(screen.getByText("100%")).toBeInTheDocument();
    expect(screen.getByText("Đã đủ tiền để mua!")).toBeInTheDocument();
  });

  it("hiện câu dự báo khi có truyền hint, không có thì không hiện", () => {
    const { rerender } = render(
      <SavingsProgress name="Laptop" cost={20_000_000} balance={5_000_000} hint="Bạn sẽ đủ tiền vào khoảng tháng 03/2027." />,
    );
    expect(screen.getByText(/đủ tiền vào khoảng tháng 03\/2027/)).toBeInTheDocument();

    rerender(<SavingsProgress name="Laptop" cost={20_000_000} balance={5_000_000} hint={null} />);
    expect(screen.queryByText(/khoảng tháng/)).not.toBeInTheDocument();
  });
});
