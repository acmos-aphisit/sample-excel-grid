#!/bin/bash

# 日付のフォーマット: YYYYMMDD_HHmmss
timestamp=$(date +"%Y%m%d_%H%M%S")

# 出力ファイル名
output_file="$OLDPWD/src/__tests__/results/CMN010/REACT_unit_test_CMN010_ログイン画面_${timestamp}.log"

# 自動単体テストスクリプト
npm run test run --reporter=verbose $OLDPWD/src/__tests__/CMN010/login.test.tsx > "$output_file" 2>&1

# テスト結果出力終了メッセージ
echo "【終了】テスト結果出力ファイル： $output_file"
