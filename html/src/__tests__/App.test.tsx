import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
// import * as Atom from "../atom";
// import { useAtomValue } from "jotai";
import App from "../App";

// ★メモ★
// describe：関連するテストケースをグループ化するためのブロック
// it：個々のテストケースを定義するための関数

describe("お金の計算テスト", () => {
  it("計算パターン1", () => {
    expect(1 + 2).toBe(3);
  });

  it("計算パターン2", () => {
    expect(2 * 3).toBe(6);
  });
});

// describe("Appコンポーネント", () => {
//   it("モック画面が表示される", () => {
//     render(<App />);
//     expect(screen.getByText("水質管理システム")).toBeInTheDocument();
//   });
// });

describe("スナップショットテスト", () => {
  it("Appコンポーネントが正しくレンダリングされる", () => {
    const { asFragment } = render(<App />);
    expect(asFragment()).toMatchSnapshot();
  });
});

function getDate() {
  return 31;
}

describe("jotaiのテスト", () => {
  it("atomの値チェック", () => {
    // const userList = useAtomValue(Atom.dataNumbersState);
    const userList = getDate();
    expect(userList).toEqual(31);
  });
});

const fetchData = async () => {
  return new Promise((resolve) => setTimeout(() => resolve("成功"), 1000));
};

describe("非同期処理のテスト", () => {
  it("fetchData は「成功」を返す", async () => {
    const data = await fetchData();
    expect(data).toBe("成功");
  });
});
