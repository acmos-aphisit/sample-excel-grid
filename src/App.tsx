import React, { useState } from "react";
import logo from "./logo.svg";
import "./App.css";
import { useRecoilValue, useSetRecoilState } from "recoil";
import * as Atom from "./atom";
import { RecoilRoot } from "recoil";

/** Handsontable */
import { registerAllModules } from "handsontable/registry";
import { HotTable } from "@handsontable/react";
import "handsontable/dist/handsontable.full.min.css";

/** React-Datasheet */
import ReactDataSheet from "react-datasheet";
import "react-datasheet/lib/react-datasheet.css";

/** ReactGrid */
import { ReactGrid, Column, Row } from "@silevis/reactgrid";
import "@silevis/reactgrid/styles.css";

function App() {
  /** React-Datasheet */
  const grid: any = [
    [
      { readOnly: true, value: "" },
      { value: "A", readOnly: true },
      { value: "B", readOnly: true },
      { value: "C", readOnly: true },
      { value: "D", readOnly: true },
    ],
    [{ readOnly: true, value: 1 }, { value: 1 }, { value: 3 }, { value: 3 }, { value: 3 }],
    [{ readOnly: true, value: 2 }, { value: 2 }, { value: 4 }, { value: 4 }, { value: 4 }],
    [{ readOnly: true, value: 3 }, { value: 1 }, { value: 3 }, { value: 3 }, { value: 3 }],
    [{ readOnly: true, value: 4 }, { value: 2 }, { value: 4 }, { value: 4 }, { value: 4 }],
  ];

  /** ReactGrid */
  const bodyData: Atom.sampleDataList[] = useRecoilValue(Atom.sampleListState);
  const setbodyData = useSetRecoilState(Atom.sampleListState);
  const data: Atom.sampleDataList[] = [
    { surname: "山田", name: "太郎" },
    { surname: "山口", name: "一郎" },
    { surname: "", name: "" },
  ];
  React.useEffect(() => {
    setbodyData(data);
  },[]);

  interface Person {
    name: string;
    surname: string;
  }

  const getColumns = (): Column[] => [
    { columnId: "姓", width: 150 },
    { columnId: "名", width: 150 },
  ];

  const headerRow: Row = {
    rowId: "header",
    cells: [
      { type: "header", text: "姓" },
      { type: "header", text: "名" },
    ],
  };

  const getRows = (people: Person[]): Row[] => [
    headerRow,
    ...people.map<Row>((person, idx) => ({
      rowId: idx,
      cells: [
        { type: "text", text: person.surname },
        { type: "text", text: person.name },
      ],
    })),
  ];

  const rows = getRows(data);
  const columns = getColumns();

  return (
    <>
      <div className="excel-grid-sample">
        <h1>グリッド：Excelスタイルのフィルター (React)</h1>

        {/* Handsontable */}
        <div className="sample-panel">
          <p>
            <a href="https://handsontable.com/docs/react-data-grid/">Handsontable</a> ※ 有料ライセンスあり
          </p>
          <HotTable
            data={[
              ["年度", "１月", "２月", "３月", "４月", "５月", "６月", "７月", "８月", "９月", "１０月", "１１月", "１２月"],
              ["令和６年", 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21],
              ["令和５年", "犬", "猫", "鶏", "牛"],
              ["令和４年", "ＲＥＡＣＴ"],
            ]}
            rowHeaders={true}
            colHeaders={true}
            colWidths={100}
            height="auto"
            autoWrapRow={false}
            autoWrapCol={false}
            licenseKey="non-commercial-and-evaluation" // for non-commercial use only
          />
        </div>

        {/* React datasheet */}
        <div className="sample-panel">
          <p>
            <a href="https://nadbm.github.io/react-datasheet/">React datasheet</a>
          </p>
          <ReactDataSheet data={grid} valueRenderer={(cell: any) => cell.value} attributesRenderer={(cell) => (cell.hint ? { "data-hint": cell.hint } : {})} />
        </div>

        {/* ReactGrid */}
        <div className="sample-panel">
          <p>
            <a href="https://reactgrid.com/">ReactGrid</a>
          </p>
          <ReactGrid rows={rows} columns={columns} enableFillHandle enableRangeSelection />
        </div>
      </div>
    </>
  );
}

export default App;
