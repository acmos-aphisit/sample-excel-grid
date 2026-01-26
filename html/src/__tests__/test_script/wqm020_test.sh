#!/bin/bash

# 日付のフォーマット: YYYYMMDD_HHmmss
timestamp=$(date +"%Y%m%d_%H%M%S")

# 出力ファイル名
output_file="$OLDPWD/src/__tests__/results/WQM020/REACT_unit_test_WQM020_検査情報検索画面_${timestamp}.log"

# 自動単体テストスクリプト
npm run test run --reporter=verbose $OLDPWD/src/__tests__/WQM020/wqm020.test.tsx > "$output_file" 2>&1

# テスト結果出力終了メッセージ
echo "テスト結果出力ファイル： $output_file"
