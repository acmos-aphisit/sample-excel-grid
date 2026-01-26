// 帳票開発用
import React, { useState } from "react";
import { Api, getMessage } from "../../common/api";
import { useAtom, useSetAtom } from "jotai";
import { Button, InputText, Select } from "../../components/common";
import * as Const from "../../common/const";
import { useNavigate } from "react-router-dom";
import * as AtomCommon from "../../stores/atom";

const ReportDev = (): JSX.Element => {
    // 処理結果メッセージ
    const setResultMessage = useSetAtom(AtomCommon.messageState);
    // 印刷API実行
    const exportReport = (params : any ) => {
    setResultMessage([]);

    // 帳票連係ファイル出力処理
    Api.postBuffer('/reportExport', setResultMessage, params)
        .then((result: ArrayBuffer) => {
         const blob = new Blob([result], {
           type: "application/octet-binary",
         });
         const disposition = result['content-disposition'] || '';
         const fileNameMatch = disposition.match(/filename="?(.+)"?/);
         const fileName = fileNameMatch ? fileNameMatch[1] : 'download.xlsx';

         const link = document.createElement("a");
         link.href = window.URL.createObjectURL(blob);
         link.download = fileName;
         link.click();
      //  .then((result: ArrayBuffer) => {
      //   const message: AtomCommon.message[] = [];
      //   message.push(getMessage(["WQ-0007I", "報告書出力"]));
      //   setResultMessage(message);
      })
      .catch((error: Error) => {
        // 想定外のエラーの場合メッセージを表示
        if (error.message !== Const.errorType["404"]) {
          const errorInfo: AtomCommon.message[] = [];
          errorInfo.push(getMessage(["WQ-0003E"]));
          setResultMessage(errorInfo);
        }
      });
  };

  return (
    <>
      <div style={{ padding: 20 }}>
        <div style={{ fontSize: 24, marginBottom: 30 }}>
          帳票出力開発用ページ
        </div>
        <div style={{ display: "flex", flexDirection: "row" }}>
          <Button
            title="霞ヶ浦水源農薬類検査結果表.xlsx"
            width="400px"
            height="42px"
            color="#4db196"
            onClick={() => {
              // 受け渡しパラメータ
              //const params = [{}, {}, {}];

              const params = {
             'reportNo':'319'
            ,'saisuiDate':'20250625'
            ,'saisuiTime':'1233'
            ,'pointNo':'2050'
            ,'inspectionKbnCode':'7200'
          };
            // 出力処理
              exportReport(params);
            }}
          />
        </div>
      </div>
    </>
  );
};

export default ReportDev;