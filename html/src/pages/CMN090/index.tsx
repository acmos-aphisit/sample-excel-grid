import React, { useState } from "react";
import { Api, getMessage } from "../../common/api";
import { useAtom, useSetAtom } from "jotai";
import { Button, Select } from "../../components/common";
import * as Const from "../../common/const";
import * as AtomCommon from "../../stores/atom";

// CSS
import cssInputRegister from "../../scss/pages/WQM010.module.scss";

const CMN090 = (): JSX.Element => {
  // サイドリストメニュー_データ
  const [selectedTable, setSelectedTable] = React.useState<string>("all_table");

  //
  const [getMessage, setMessage] = useAtom(AtomCommon.messageState);

  const migrateCsvToDb = () => {
    // メッセージクリア
    setMessage([]);

    // リクエストデータ
    const request: { table_name: string } = {
      table_name: selectedTable,
    };

    // ログイン処理
    Api.post("/common/migrateCsvToDb", setMessage, request)
      .then((data: any) => {
        if (data[0] == true) {
          alert("移行が正常に終了しました。");
        } else {
          alert("移行が異常に終了しました。");
        }
        console.log(getMessage);
      })
      .catch((error: Error) => {
        console.log(error);
      });
  };

  return (
    <>
      <div className="container_range" style={{ zIndex: "0" }}>
        <div className={`${cssInputRegister.WQM010_input_container}`}>
          <>
            <h1 style={{ margin: "10px 0px 0px 80px", width: "90%" }}>
              データ移行処理
            </h1>
            <div className="db_init_container">
              <label>データ移行テーブル：</label>
              <div className="input_area">
                <Select
                  className="disabled_bg_color"
                  name="kinnyuu_zokugara"
                  value={selectedTable}
                  width="95%"
                  options={Const.TABLE_LISTS}
                  onChange={({
                    target: { value },
                  }: React.ChangeEvent<HTMLInputElement>) => {
                    setSelectedTable(value);
                  }}
                />
                <Button
                  title="移行"
                  width="100px"
                  height="42px"
                  color="#4d5fb1"
                  onClick={() => {
                    migrateCsvToDb();
                  }}
                />
              </div>
            </div>
          </>
        </div>
      </div>
    </>
  );
};

export default CMN090;
