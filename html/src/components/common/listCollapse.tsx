// 折り畳みリスト用コンポーネント
import React from 'react';
import { useAtom, useSetAtom } from "jotai";

// 折り畳みリストスタイル
import cssList from '../../scss/common/listCollapse.module.scss'

// サイドメニューアトム
import * as AtomSideMenu from "../../stores/atomSideMenu";

const MenuItemComponent: React.FC<{ item: any, index: number, level: number }> = ({ item, index, level }) => {
    // メニュー開閉
    function toggleCollapeMenu(menuId: string) {
        const selectMenu = document.getElementById(menuId)!;
        for (let index: number = 0; index < selectMenu.children.length; index++) {
            if (index > 0) {
                // メニュー開閉
                if (selectMenu.children[index].classList.contains(`${cssList.hide}`)) {
                    selectMenu.children[index].classList.remove(`${cssList.hide}`);
                } else {
                    selectMenu.children[index].classList.add(`${cssList.hide}`);
                }
            } else {
                // メニュー開閉_アイコン変更
                if (selectMenu.children[index].classList.contains(`${cssList.menu_comp_parent_child_open}`)) {
                    selectMenu.children[index].classList.add(`${cssList.menu_comp_parent_child_close}`);
                    selectMenu.children[index].classList.remove(`${cssList.menu_comp_parent_child_open}`);
                } else {
                    selectMenu.children[index].classList.add(`${cssList.menu_comp_parent_child_open}`);
                    selectMenu.children[index].classList.remove(`${cssList.menu_comp_parent_child_close}`);
                }
            }
        }
    }

    if (!item.showFlg) return null;

    return (
        <>
            {item.list.length > 0 ? (
                <div key={'menu-comp-level' + level + '-div' + index} id={'menu-comp-level' + level + '-div' + index} className={(level == 1) ? `` : `${cssList.menu_comp_parent_child}`}>
                    <div key={'menu-comp-level' + level + '-item' + index} id={'menu-comp-level' + level + '-item' + index} className={`${cssList.menu_comp_parent_child_open}`} onClick={() => { toggleCollapeMenu('menu-comp-level' + level + '-div' + index) }}>{item.title}</div>
                    {item.list.map((item, key) => (
                        <MenuItemComponent item={item} index={key} level={level + 1} />
                    ))}
                </div>
            ) : (
                <div key={'menu-comp-level' + level + '-div' + index} id={'menu-comp-level' + level + '-div' + index} className={(level == 1) ? `${cssList.menu_comp_parent_child} ${cssList.level1}` : `${cssList.menu_comp_parent_child}`}>
                    <div key={'menu-comp-level' + level + '-item' + index} id={'menu-comp-level' + level + '-item' + index} >{item.title}</div>
                </div>
            )}
        </>
    );
};


// 属性設定
interface Props {
    data?: any[];
}

// 折り畳みリスト
export var ListCollapse: React.FC<Props> = function ({
    data = [],
}) {
    // サイドリストメニュー_データ
    const [dataSideMenu, setDataSideMenu] = useAtom(AtomSideMenu.sideMenuListState);

    // 絞り込み検索ステート
    const [dataSideSearchMenu, setDataSideSearchMenu] = useAtom(AtomSideMenu.sideMenuSearchState);

    // 絞り込み検索結果ステート
    const [dataSideSearchListMenu, setDataSideSearchListMenu] = useAtom(AtomSideMenu.sideMenuSearchListState);
    const [openMenuFlg, setOpenMenuFlg] = React.useState<number>(0);


    // メニュー開閉
    function toggleCollapeMenu(menuId: string) {
        const selectMenu = document.getElementById(menuId)!;
        for (let index: number = 0; index < selectMenu.children.length; index++) {
            if (index > 0) {
                // メニュー開閉
                if (selectMenu.children[index].classList.contains(`${cssList.hide}`)) {
                    selectMenu.children[index].classList.remove(`${cssList.hide}`);
                } else {
                    selectMenu.children[index].classList.add(`${cssList.hide}`);
                }
            } else {
                // メニュー開閉_アイコン変更
                if (selectMenu.children[index].classList.contains(`${cssList.menu_comp_parent_child_open}`)) {
                    selectMenu.children[index].classList.add(`${cssList.menu_comp_parent_child_close}`);
                    selectMenu.children[index].classList.remove(`${cssList.menu_comp_parent_child_open}`);
                } else {
                    selectMenu.children[index].classList.add(`${cssList.menu_comp_parent_child_open}`);
                    selectMenu.children[index].classList.remove(`${cssList.menu_comp_parent_child_close}`);
                }
            }
        }
    }

    const checkSearchMenuAllLevel = (data: any, level: number, prevData: any, prevKey: number) => {
        console.log("現在：LEVELー" + level);

        data.forEach((item, key) => {
            if (!dataSideSearchMenu || data[key].title.includes(dataSideSearchMenu)) {
                data[key].showFlg = true;
                if (prevKey >= 0) {
                    console.log("prevData[prevKey]", prevData[prevKey]);

                    prevData[prevKey].showFlg = true;
                }
            } else {
                data[key].showFlg = false;
            }

            if (data[key].list.length > 0) {
                // 次の階層を続く
                checkSearchMenuAllLevel(data[key].list, level + 1, data, key);
            }
        });

    };

    // 絞り込み検索処理
    React.useEffect(() => {
        let newList = dataSideMenu;
        checkSearchMenuAllLevel(newList, 1, null, -1);

        setDataSideSearchListMenu(newList);

        console.log("dataSideSearchListMenu", dataSideSearchListMenu);
        setOpenMenuFlg(prev => prev + 1);

    }, [dataSideSearchMenu, dataSideSearchListMenu]);

    // リストメニュー一覧部生成
    const bodyHtml: JSX.Element[] = [];

    return (
        <>
            {/* メニュー構成 */}
            <div key={openMenuFlg} id='menu-comp-list' className={`${cssList.menu_comp_list}`}>
                {/* メニュー表示 */}
                {dataSideSearchListMenu?.map((item, key) => (
                    <>
                        <MenuItemComponent item={item} index={key} level={1} />
                    </>
                ))}

            </div>
        </>
    );
};