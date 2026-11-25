import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { Field, FieldError, fieldProps } from "./form-field";

afterEach(cleanup);

describe("<FieldError />", () => {
  it("hiện lỗi đầu tiên với role=alert", () => {
    render(<FieldError name="amount" errors={["Nhập số tiền", "Lỗi khác"]} />);

    const alert = screen.getByRole("alert");
    expect(alert).toHaveTextContent("Nhập số tiền");
    expect(alert).toHaveAttribute("id", "amount-error");
  });

  it("không có lỗi thì không hiện gì", () => {
    const { container } = render(<FieldError name="amount" errors={undefined} />);
    expect(container).toBeEmptyDOMElement();
  });
});

describe("<Field /> + fieldProps", () => {
  it("nhãn gắn đúng với ô nhập và ô lỗi được đánh dấu aria-invalid", () => {
    render(
      <Field name="amount" label="Số tiền" errors={["Nhập số tiền"]}>
        <input {...fieldProps("amount", ["Nhập số tiền"])} />
      </Field>,
    );

    const input = screen.getByLabelText("Số tiền");
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input).toHaveAttribute("aria-describedby", "amount-error");
  });

  it("ô hợp lệ không có aria-invalid", () => {
    render(
      <Field name="amount" label="Số tiền">
        <input {...fieldProps("amount")} />
      </Field>,
    );
    expect(screen.getByLabelText("Số tiền")).not.toHaveAttribute("aria-invalid");
  });
});
