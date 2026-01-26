// フッター用コンポーネント
interface Props {
    title?: [];
    className?: [];
}

const Footer = (Props): JSX.Element => {

    const bodyHtml: JSX.Element[] = []; // tablebody部格納用
    Props.title.forEach((item, key) => {
        bodyHtml.push(
            <li
                key={key}
                tabIndex={key}
                className={Props.className[key]}
            >
                {Props.title[key]}
            </li>
        );
    });

    return (
        <footer>
            <ul className="foot_nav">
                {bodyHtml}
            </ul>
        </footer>
    );
};

export default Footer;