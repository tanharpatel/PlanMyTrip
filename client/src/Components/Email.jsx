import React from 'react';

export default function Email() {
  return (
    <div>
      <meta name="viewport" content="width=device-width" />
      <meta httpEquiv="Content-Type" content="text/html; charset=UTF-8" />
      <title />
      <style dangerouslySetInnerHTML={{ __html: "\n      img {\n        border: none;\n        -ms-interpolation-mode: bicubic;\n        max-width: 100%; \n      }\n      body {\n        background-color: #f6f6f6;\n        font-family: sans-serif;\n        -webkit-font-smoothing: antialiased;\n        font-size: 14px;\n        line-height: 1.4;\n        margin: 0;\n        padding: 0;\n        -ms-text-size-adjust: 100%;\n        -webkit-text-size-adjust: 100%; \n      }\n      table {\n        border-collapse: separate;\n        mso-table-lspace: 0pt;\n        mso-table-rspace: 0pt;\n        width: 100%; }\n        table td {\n          font-family: sans-serif;\n          font-size: 14px;\n          vertical-align: top; \n      }\n      .body {\n        background-color: #f6f6f6;\n        width: 100%; \n      }\n      .container {\n        display: block;\n        margin: 0 auto !important;\n        /* makes it centered */\n        max-width: 580px;\n        padding: 10px;\n        width: 580px; \n      }\n      .content {\n        box-sizing: border-box;\n        display: block;\n        margin: 0 auto;\n        max-width: 580px;\n        padding: 10px; \n      }\n      .main {\n        background: #ffffff;\n        border-radius: 3px;\n        width: 100%; \n      }\n      .wrapper {\n        box-sizing: border-box;\n        padding: 20px; \n      }\n      .content-block {\n        padding-bottom: 10px;\n        padding-top: 10px;\n      }\n      .footer {\n        clear: both;\n        margin-top: 10px;\n        text-align: center;\n        width: 100%; \n      }\n        .footer td,\n        .footer p,\n        .footer span,\n        .footer a {\n          color: #999999;\n          font-size: 12px;\n          text-align: center; \n      }\n      h1,\n      h2,\n      h3,\n      h4 {\n        color: #000000;\n        font-family: sans-serif;\n        font-weight: 400;\n        line-height: 1.4;\n        margin: 0;\n        margin-bottom: 30px; \n      }\n      h1 {\n        font-size: 35px;\n        font-weight: 300;\n        text-align: center;\n        text-transform: capitalize; \n      }\n      p,\n      ul,\n      ol {\n        font-family: sans-serif;\n        font-size: 14px;\n        font-weight: normal;\n        margin: 0;\n        margin-bottom: 15px; \n      }\n        p li,\n        ul li,\n        ol li {\n          list-style-position: inside;\n          margin-left: 5px; \n      }\n      a {\n        color: #ff0000;\n        text-decoration: underline; \n      }\n      .btn {\n        box-sizing: border-box;\n        width: 100%; }\n        .btn > tbody > tr > td {\n          padding-bottom: 15px; }\n        .btn table {\n          width: auto; \n      }\n        .btn table td {\n          background-color: #ffffff;\n          border-radius: 5px;\n          text-align: center; \n      }\n        .btn a {\n          background-color: #ffffff;\n          border: solid 1px #006FFF;\n          border-radius: 5px;\n          box-sizing: border-box;\n          color: #006FFF;\n          cursor: pointer;\n          display: inline-block;\n          font-size: 14px;\n          font-weight: bold;\n          margin: 0;\n          padding: 12px 25px;\n          text-decoration: none;\n          text-transform: capitalize; \n      }\n      .btn-primary table td {\n        background-color: #006FFF; \n      }\n      .btn-primary a {\n        background-color: #006FFF;\n        border-color: #006FFF;\n        color: #ffffff; \n      }\n      .last {\n        margin-bottom: 0; \n      }\n      .first {\n        margin-top: 0; \n      }\n      .align-center {\n        text-align: center; \n      }\n      .align-right {\n        text-align: right; \n      }\n      .align-left {\n        text-align: left; \n      }\n      .clear {\n        clear: both; \n      }\n      .mt0 {\n        margin-top: 0; \n      }\n      .mb0 {\n        margin-bottom: 0; \n      }\n      .preheader {\n        color: transparent;\n        display: none;\n        height: 0;\n        max-height: 0;\n        max-width: 0;\n        opacity: 0;\n        overflow: hidden;\n        mso-hide: all;\n        visibility: hidden;\n        width: 0; \n      }\n      .powered-by a {\n        text-decoration: none; \n      }\n      hr {\n        border: 0;\n        border-bottom: 1px solid #f6f6f6;\n        margin: 20px 0; \n      }\n      @media only screen and (max-width: 620px) {\n        table[className=body] h1 {\n          font-size: 28px !important;\n          margin-bottom: 10px !important; \n        }\n        table[className=body] p,\n        table[className=body] ul,\n        table[className=body] ol,\n        table[className=body] td,\n        table[className=body] span,\n        table[className=body] a {\n          font-size: 16px !important; \n        }\n        table[className=body] .wrapper,\n        table[className=body] .article {\n          padding: 10px !important; \n        }\n        table[className=body] .content {\n          padding: 0 !important; \n        }\n        table[className=body] .container {\n          padding: 0 !important;\n          width: 100% !important; \n        }\n        table[className=body] .main {\n          border-left-width: 0 !important;\n          border-radius: 0 !important;\n          border-right-width: 0 !important; \n        }\n        table[className=body] .btn table {\n          width: 100% !important; \n        }\n        table[className=body] .btn a {\n          width: 100% !important; \n        }\n        table[className=body] .img-responsive {\n          height: auto !important;\n          max-width: 100% !important;\n          width: auto !important; \n        }\n      }\n      @media all {\n        .ExternalClass {\n          width: 100%; \n        }\n        .ExternalClass,\n        .ExternalClass p,\n        .ExternalClass span,\n        .ExternalClass font,\n        .ExternalClass td,\n        .ExternalClass div {\n          line-height: 100%; \n        }\n        .apple-link a {\n          color: inherit !important;\n          font-family: inherit !important;\n          font-size: inherit !important;\n          font-weight: inherit !important;\n          line-height: inherit !important;\n          text-decoration: none !important; \n        }\n        .btn-primary table td:hover {\n          background-color: #006FFF !important; \n        }\n        .btn-primary a:hover {\n          background-color: #006FFF !important;\n          border-color: #006FFF !important; \n        } \n      }\n      \n    " }} />
      <table className="body" role="presentation" border={0} cellPadding={0} cellSpacing={0}>
        <tbody>
          <tr>
            <td />
            <td className="container">
              <div className="content">
                {/* START CENTERED WHITE CONTAINER*/}
                <table className="main" role="presentation">
                  {/* START MAIN AREA*/}
                  <tbody>
                    <tr>
                      <td className="wrapper">
                        <table role="presentation" border={0} cellPadding={0} cellSpacing={0}>
                          <tbody>
                            <tr>
                              <td>
                                {/* CONTENT*/}
                                <p>Hi NAME,</p>
                                <p>Welcome to Natours, we're glad to have you 🎉🙏</p>
                                <p>We're all a big familiy here, so make sure to upload your user photo so we get to know you a bit better!</p>
                                <table className="btn btn-primary" role="presentation" border={0} cellPadding={0} cellSpacing={0}>
                                  <tbody>
                                    <tr>
                                      <td align="center">
                                        <tr >
                                          <td><a href="#" target="_blank">Upload user photo</a></td>
                                        </tr>
                                      </td>
                                    </tr>
                                  </tbody>
                                </table>
                                <p>If you need any help with booking your next tour, please don't hesitate to contact me!</p>
                                <p>- Jonas Schmedtmann, CEO</p>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </td>
                    </tr>
                  </tbody>
                </table>
                {/* START FOOTER*/}
                <div className="footer">
                  <table role="presentation" border={0} cellPadding={0} cellSpacing={0}>
                    <tbody>
                      <tr>
                        <td className="content-block"><span className="apple-link">Natours Inc, 123 Nowhere Road, San Francisco CA 99999</span><br /> Don't like these emails? <a href="#">Unsubscribe</a></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}