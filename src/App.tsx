import React, { useState } from "react";
import logo from "./logo.svg";
import "./App.css";
import { useRecoilValue, useSetRecoilState } from "recoil";
import * as Atom from "./atom";
import { RecoilRoot } from "recoil";

/** ReactGrid */
import { ReactGrid, Column, Row, CellChange, TextCell, DefaultCellTypes } from "@silevis/reactgrid";
import "@silevis/reactgrid/styles.css";
import moment from 'moment';

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
    { surname: "日本", name: "太郎", age: "20", gender: "男性", birthDate: new Date("1987-05-05"), birthDateStr: "", checkFlg: true, status: "活性", isOpen: false },
    { surname: "山田", name: "一郎", age: "35", gender: "男性", birthDate: undefined, birthDateStr: "", checkFlg: true, status: "", isOpen: false },
    { surname: "山本", name: "二郎", age: "19", gender: "男性", birthDate: undefined, birthDateStr: "", checkFlg: false, status: "", isOpen: false },
    { surname: "山口", name: "花子", age: "28", gender: "女性", birthDate: undefined, birthDateStr: "", checkFlg: false, status: "", isOpen: false },
    { surname: "佐藤", name: "健太", age: "56", gender: "男性", birthDate: undefined, birthDateStr: "", checkFlg: false, status: "", isOpen: false },
    { surname: "田中", name: "さくら", age: "24", gender: "女性", birthDate: undefined, birthDateStr: "", checkFlg: false, status: "", isOpen: false },
    { surname: "渡辺", name: "三郎", age: "31", gender: "男性", birthDate: undefined, birthDateStr: "", checkFlg: false, status: "", isOpen: false },
    { surname: "高橋", name: "りん", age: "45", gender: "女性", birthDate: undefined, birthDateStr: "", checkFlg: false, status: "", isOpen: false },
    { surname: "伊藤", name: "四郎", age: "29", gender: "男性", birthDate: undefined, birthDateStr: "", checkFlg: false, status: "", isOpen: false },
    { surname: "鈴木", name: "五郎", age: "30", gender: "男性", birthDate: undefined, birthDateStr: "", checkFlg: false, status: "", isOpen: false },
    { surname: "日本", name: "太郎", age: "20", gender: "男性", birthDate: new Date("1974-12-31"), birthDateStr: "", checkFlg: true, status: "活性", isOpen: false },
    { surname: "山田", name: "一郎", age: "35", gender: "男性", birthDate: undefined, birthDateStr: "", checkFlg: true, status: "無活性", isOpen: false },
    { surname: "山本", name: "二郎", age: "19", gender: "男性", birthDate: undefined, birthDateStr: "", checkFlg: false, status: "", isOpen: false },
    { surname: "山口", name: "花子", age: "28", gender: "女性", birthDate: undefined, birthDateStr: "", checkFlg: false, status: "", isOpen: false },
    { surname: "佐藤", name: "健太", age: "56", gender: "男性", birthDate: undefined, birthDateStr: "", checkFlg: false, status: "", isOpen: false },
    { surname: "田中", name: "さくら", age: "24", gender: "女性", birthDate: undefined, birthDateStr: "", checkFlg: false, status: "", isOpen: false },
    { surname: "渡辺", name: "三郎", age: "31", gender: "男性", birthDate: undefined, birthDateStr: "", checkFlg: false, status: "", isOpen: false },
    { surname: "高橋", name: "りん", age: "45", gender: "女性", birthDate: undefined, birthDateStr: "", checkFlg: false, status: "", isOpen: false },
    { surname: "伊藤", name: "四郎", age: "29", gender: "男性", birthDate: undefined, birthDateStr: "", checkFlg: false, status: "", isOpen: false },
    { surname: "鈴木", name: "五郎", age: "30", gender: "男性", birthDate: undefined, birthDateStr: "", checkFlg: false, status: "", isOpen: false },
    { surname: "", name: "", age: "", gender: "", birthDate: undefined, birthDateStr: "", checkFlg: false, status: "", isOpen: false },
  ];
  React.useEffect(() => {
    setbodyData(data);
  },[]);

  const getColumns = (): Column[] => [
    { columnId: "no", resizable: true, reorderable: true },
    { columnId: "surname", resizable: true, reorderable: true },
    { columnId: "name" },
    { columnId: "age" },
    { columnId: "gender" },
    { columnId: "birthDate" },
    { columnId: "checkFlg" },
    { columnId: "status" },
  ];

  const headerRow: Row = {
    rowId: "header",
    cells: [
      { type: "header", text: "" },
      { type: "header", text: "姓" },
      { type: "header", text: "名" },
      { type: "header", text: "年齢" },
      { type: "header", text: "性別" },
      { type: "header", text: "生年月日" },
      { type: "header", text: "編集可能" },
      { type: "header", text: "状態" },
    ],
  };

  const statusLists = [
    { label: '活性', value: '活性' },
    { label: '無活性', value: '無活性' },
  ];
  const getRows = (people: Atom.sampleDataList[]): Row[] => [
    headerRow,
    ...people.map<Row>((person, idx) => ({
      rowId: idx,
      cells: [
        { type: "number", value: idx },
        { type: "text", text: person.surname },
        { type: "text", text: person.name },
        { type: "text", text: person.age, nonEditable: !person.checkFlg, className: !person.checkFlg ? "dataAge" : "" },
        { type: "text", text: person.gender },
        { type: "date", date: person.birthDate},
        { type: "checkbox", checked: person.checkFlg },
        { type: "dropdown",　selectedValue: person.status, values: statusLists, isOpen: person.isOpen },
      ],
    })),
  ];

  const getRows2 = (people: Atom.sampleDataList[]): Row[] => [
    headerRow,
    ...people.map<Row>((person, idx) => ({
      rowId: idx,
      cells: [
        { type: "number", value: idx },
        { type: "text", text: person.surname },
        { type: "text", text: person.name },
        { type: "text", text: person.age, nonEditable: !person.checkFlg, className: !person.checkFlg ? "dataAge" : "" },
        { type: "text", text: person.gender },
        { type: "date", date: person.birthDate},
        { type: "checkbox", checked: person.checkFlg },
        { type: "dropdown",　selectedValue: person.status, values: statusLists, isOpen: person.isOpen },
      ],
    })),
  ];

  const rows = getRows(bodyData);
  const [columns, setColumns] = React.useState<Column[]>(getColumns());

  const handleChanges = (changes: CellChange<any>[]) => { 
    //setbodyData((prevPeople) => applyChangesToPeople(changes, prevPeople));
    console.log(changes);

    let newList = bodyData;
    changes.forEach(changeItem => {
      let columnIdx = changeItem.columnId;
      
      newList = [...Object.values(newList)].map((item, key) => {
        if (key === changeItem.rowId) {
          // コラム名を指定
          let updatedFieldName = `${columnIdx}`;
          let changedData = changeItem.newCell.text;
          if (columnIdx == "birthDate") {
            changedData = changeItem.newCell.date;
          } else if (columnIdx == "status") {
            const changedIsopen = changeItem.newCell.isOpen;
            changedData = changeItem.newCell.text;
            return { ...item, isOpen:  changedIsopen, status: changedData};
          } else if (columnIdx == "checkFlg") {
            changedData = changeItem.newCell.checked;
          }
          return { ...item, [updatedFieldName]:  changedData};
        } else {
          return item;
        }
      });

      console.log(newList);
      
    });

    
    setbodyData(newList);
  };

  const applyChangesToPeople = (
    changes: CellChange<TextCell>[],
    prevPeople: Atom.sampleDataList[]
  ): Atom.sampleDataList[] => {
    changes.forEach((change) => {
      const personIndex:any = change.rowId;
      const fieldName:any = change.columnId;
      prevPeople[personIndex].surname = change.newCell.text;
    });
    return [...prevPeople];
  };

  const handleChanges2 = (changes: CellChange<any>[]) => {
    setbodyData((prevPeople) => applyChangesToPeople(changes, prevPeople));
  };

  const handleColumnResize = (ci: any, width: number) => {
    setColumns((prevColumns) => {
        const columnIndex = prevColumns.findIndex(el => el.columnId === ci);
        const resizedColumn = prevColumns[columnIndex];
        const updatedColumn = { ...resizedColumn, width };
        prevColumns[columnIndex] = updatedColumn;
        return [...prevColumns];
    });
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
          <div className="react-grid-panel" style={{ width: "60vw", height: "50vh", overflow: "scroll" }}>
            <ReactGrid 
              rows={rows} 
              columns={columns} 
              onCellsChanged={handleChanges}
              onColumnResized={handleColumnResize}
              stickyLeftColumns={3}
              stickyTopRows={1}
              enableFillHandle 
              enableRangeSelection
              enableRowSelection
              enableColumnSelection
            />
          </div>
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
