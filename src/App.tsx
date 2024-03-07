import React, { useState } from "react";
import logo from "./logo.svg";
import "./App.css";
import { useRecoilValue, useSetRecoilState } from "recoil";
import * as Atom from "./atom";
import { RecoilRoot } from "recoil";

/** ReactGrid */
import { ReactGrid, Column, Row, CellChange, TextCell, DefaultCellTypes} from "@silevis/reactgrid";
import "@silevis/reactgrid/styles.css";

/** Handsontable */
import { registerAllModules } from "handsontable/registry";
import { HotTable } from "@handsontable/react";
import "handsontable/dist/handsontable.full.min.css";

/** React-Datasheet */
import ReactDataSheet from "react-datasheet";
import "react-datasheet/lib/react-datasheet.css";

function App() {
  /** ReactGrid */
  const bodyData: Atom.sampleDataList[] = useRecoilValue(Atom.sampleListState);
  const setbodyData = useSetRecoilState(Atom.sampleListState);
  const data: Atom.sampleDataList[] = [
    { surname: "日本", name: "太郎", age: "20", gender: "男性", birthDate: undefined, checkFlg: false },
    { surname: "山田", name: "一郎", age: "35", gender: "男性", birthDate: undefined, checkFlg: false },
    { surname: "山本", name: "二郎", age: "35", gender: "男性", birthDate: undefined, checkFlg: false },
    { surname: "山口", name: "花子", age: "35", gender: "女性", birthDate: undefined, checkFlg: false },
    { surname: "", name: "", age: "", gender: "", birthDate: undefined, checkFlg: false },
  ];
  React.useEffect(() => {
    setbodyData(data);
  },[]);

  const getColumns = (): Column[] => [
    { columnId: "surname", width: 150 },
    { columnId: "name", width: 150 },
    { columnId: "age", width: 150 },
    { columnId: "gender", width: 150 },
    { columnId: "birthDate", width: 150 },
    { columnId: "checkFlg", width: 150 },
  ];

  const headerRow: Row = {
    rowId: "header",
    cells: [
      { type: "header", text: "姓" },
      { type: "header", text: "名" },
      { type: "header", text: "年齢" },
      { type: "header", text: "性別" },
      { type: "header", text: "生年月日" },
      { type: "header", text: "チェック" },
    ],
  };

  const getRows = (people: Atom.sampleDataList[]): Row[] => [
    headerRow,
    ...people.map<Row>((person, idx) => ({
      rowId: idx,
      cells: [
        { type: "text", text: person.surname },
        { type: "text", text: person.name },
        { type: "text", text: person.age },
        { type: "text", text: person.gender },
        { type: "date", date: person.birthDate },
        { type: "checkbox", checked: person.checkFlg },
      ],
    })),
  ];

  const rows = getRows(bodyData);
  const columns = getColumns();
  
  const handleChanges = (changes: CellChange<any>[]) => { 
    //setbodyData((prevPeople) => applyChangesToPeople(changes, prevPeople));
    console.log(changes[0]);

    const columnIdx = changes[0].columnId;
    let newList = [...Object.values(bodyData)].map((item, key) => {
      if (key === changes[0].rowId) {
        // コラム名を指定
        const updatedFieldName = `${columnIdx}`;
        let changedData = changes[0].newCell.text;
        if (columnIdx == "birthDate") {
          changedData = changes[0].newCell.date;
        } else {
          changedData = changes[0].newCell.checked;
        }
        return { ...item, [updatedFieldName]:  changedData};
      } else {
        return item;
      }
    });
    console.log(newList);
    setbodyData(newList);
  }; 

  /** Handsontable */
  const HandsonData: any = [
    ["年度", "１月", "２月", "３月", "４月", "５月", "６月", "７月", "８月", "９月", "１０月", "１１月", "１２月"],
    ["令和６年", 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21],
    ["令和５年", "犬", "猫", "鶏", "牛"],
    ["令和４年", "ＲＥＡＣＴ"],
  ];

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

  return (
    <>
      <div className="excel-grid-sample">
        <h1>グリッド：Excelスタイルのフィルター (React)</h1>

        {/* ReactGrid */}
        <div className="sample-panel">
          <p>
            <a href="https://reactgrid.com/">ReactGrid</a> ※ 一番適当だと思います。
          </p>
          <ReactGrid rows={rows} columns={columns} onCellsChanged={handleChanges} enableFillHandle enableRangeSelection />
        </div>

        {/* Handsontable */}
        <div className="sample-panel">
          <p>
            <a href="https://handsontable.com/docs/react-data-grid/">Handsontable</a> ※ 有料ライセンスあり
          </p>
          <HotTable
            data={HandsonData}
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
      </div>
    </>
  );
}

export default App;
