const crypto = require("crypto");
const { promisify } = require("util");
const jwt = require("jsonwebtoken");
const User = require("./../model/userModel");
const catchAsync = require("./../utils/catchAsync");
const appError = require("./../utils/appError");
const sendEmail = require("./../utils/email");

const signToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN,
    });
};

const createSendToken = (user, statusCode, res) => {
    const token = signToken(user._id);
    const cookieOptions = {
        expires: new Date(
            Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
        ),
        httpOnly: true,
    };
    if (process.env.NODE_ENV === "production") cookieOptions.secure = true;

    res.cookie("jwt", token, cookieOptions);

    //remove password from the output
    user.password = undefined;

    res.status(statusCode).json({
        status: "success",
        token,
        data: {
            user,
        },
    });
};

exports.signup = catchAsync(async (req, res, next) => {
    const newUser = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        passwordConfirm: req.body.passwordConfirm,
        role: req.body.role,
    });
    createSendToken(newUser, 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
    const { email, password } = req.body;

    //1) check if email and password exist
    if (!email || !password) {
        return next(new appError("Please provide email and password", 400));
    }

    //2) check if user exist && password is correct
    const user = await User.findOne({ email }).select("+password");

    if (!user || !(await user.correctPassword(password, user.password))) {
        return next(new appError("Incorrect email or password", 401));
    }

    //3) If everything okay, then send token to client
    createSendToken(user, 200, res);
});

exports.protect = catchAsync(async (req, res, next) => {
    //1) get the token and check of it's there
    let token;
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer")
    ) {
        token = req.headers.authorization.split(" ")[1];
    }
    if (!token) {
        return next(
            new appError("You are not logged in! Please log in to get access", 401)
        );
    }

    //2) Verification token
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    //3) check if user still exist
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
        return next(
            new appError("The user belonging to this token does no longer exist", 401)
        );
    }

    //4) check if user change password after the token was issued
    if (currentUser.changedPasswordAfter(decoded.iat)) {
        return next(
            new appError("User recently changed password! Please log in again.", 401)
        );
    }

    //grant access to protected route
    req.user = currentUser;
    next();
});

exports.restrictTo = (...roles) => {
    return (req, res, next) => {
        //roles ['admin', 'lead-guide']
        if (!roles.includes(req.user.role)) {
            return next(
                new appError("You do not have permission to perform this action", 403)
            );
        }

        next();
    };
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
    //1) get user based on posted email
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
        return next(new appError("There is no user with this email address", 404));
    }

    //2) generate a random reset token
    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    //3) semd it to user's email
    const resetURL = `http://localhost:3000/resetPassword/${resetToken}`;
    const message = `Forgot the passsword? Submit a update request with your new password and passwordConfirm
     to: ${resetURL}
     \nIf you didn't forget your password, please ignore this email!`;
    let pwdTemplate = `<!DOCTYPE html>
  <html>
  <head>
      <meta name="viewport" content="width=device-width">
      <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
      <title>Welcome {{name}}</title>
      <style type="text/css">
          @media only screen and (max-width: 620px) {
              table[class=body] h1 {
                  font-size: 28px !important;
                  margin-bottom: 10px !important;
              }
              table[class=body] p,
              table[class=body] ul,
              table[class=body] ol,
              table[class=body] td,
              table[class=body] span,
              table[class=body] a {
                  font-size: 16px !important;
              }
              table[class=body] .wrapper,
              table[class=body] .article {
                  padding: 10px !important;
              }
              table[class=body] .content {
                  padding: 0 !important;
              }
              table[class=body] .container {
                  padding: 0 !important;
                  width: 100% !important;
              }
              table[class=body] .main {
                  border-left-width: 0 !important;
                  border-radius: 0 !important;
                  border-right-width: 0 !important;
              }
              table[class=body] .btn table {
                  width: 100% !important;
              }
              table[class=body] .btn a {
                  width: 100% !important;
              }
              table[class=body] .img-responsive {
                  height: auto !important;
                  max-width: 100% !important;
                  width: auto !important;
              }
          }
          @media all {
              .ExternalClass {
                  width: 100%;
              }
              .ExternalClass,
              .ExternalClass p,
              .ExternalClass span,
              .ExternalClass font,
              .ExternalClass td,
              .ExternalClass div {
                  line-height: 100%;
              }
              .apple-link a {
                  color: inherit !important;
                  font-family: inherit !important;
                  font-size: inherit !important;
                  font-weight: inherit !important;
                  line-height: inherit !important;
                  text-decoration: none !important;
              }
              .btn-primary table td:hover {
                  background-color: #34495e !important;
              }
              .btn-primary a:hover {
                  background-color: #34495e !important;
                  border-color: #34495e !important;
              }
          }
      </style>
  </head>
  <body class=""
        style="background-color:#f6f6f6;font-family:sans-serif;-webkit-font-smoothing:antialiased;font-size:14px;line-height:1.4;margin:0;padding:0;-ms-text-size-adjust:100%;-webkit-text-size-adjust:100%;">
  <table border="0" cellpadding="0" cellspacing="0" class="body"
         style="border-collapse:separate;mso-table-lspace:0pt;mso-table-rspace:0pt;background-color:#f6f6f6;width:100%;">
      <tr>
          <td style="font-family:sans-serif;font-size:14px;vertical-align:top;">&nbsp;</td>
          <td class="container"
              style="font-family:sans-serif;font-size:14px;vertical-align:top;display:block;max-width:580px;padding:10px;width:580px;Margin:0 auto !important;">
              <div class="content"
                   style="box-sizing:border-box;display:block;Margin:0 auto;max-width:580px;padding:10px;">
                  <!-- START CENTERED WHITE CONTAINER -->
                  <span class="preheader"
                        style="color:transparent;display:none;height:0;max-height:0;max-width:0;opacity:0;overflow:hidden;mso-hide:all;visibility:hidden;width:0;">Reset your PlanMyTrip password.</span>
                  <table class="main"
                         style="border-collapse:separate;mso-table-lspace:0pt;mso-table-rspace:0pt;background:#fff;border-radius:3px;width:100%;">
                      <!-- START MAIN CONTENT AREA -->
                      <tr>
                          <td class="wrapper"
                              style="font-family:sans-serif;font-size:14px;vertical-align:top;box-sizing:border-box;padding:20px;">
                              <table border="0" cellpadding="0" cellspacing="0"
                                     style="border-collapse:separate;mso-table-lspace:0pt;mso-table-rspace:0pt;width:100%;">
                                  <tr>
                                      <td style="font-family:sans-serif;font-size:14px;vertical-align:top;">
                                          <p style="font-family:sans-serif;font-size:14px;font-weight:normal;margin:0;Margin-bottom:15px;">
                                              Hello!</p>
                                          <p style="font-family:sans-serif;font-size:14px;font-weight:normal;margin:0;Margin-bottom:15px;">
                                          Forgot your PlanMyTrip password?
                                          <br /> <br />
                                          Don’t worry! You can use the following button to reset your password:</p>
                                          <table border="0" cellpadding="0" cellspacing="0" class="btn btn-primary"
                                                 style="border-collapse:separate;mso-table-lspace:0pt;mso-table-rspace:0pt;box-sizing:border-box;width:100%;">
                                              <tbody>
                                              <tr>
                                                  <td align="left"
                                                      style="font-family:sans-serif;font-size:14px;vertical-align:top;padding-bottom:15px;">
                                                      <table border="0" cellpadding="0" cellspacing="0"
                                                             style="border-collapse:separate;mso-table-lspace:0pt;mso-table-rspace:0pt;width:100%;width:auto;">
                                                          <tbody>
                                                          <tr>
                                                              <td style="font-family:sans-serif;font-size:14px;vertical-align:top;background-color:#ffffff;border-radius:5px;text-align:center;background-color:#3498db;">
                                                                  <a href=${resetURL} target="_blank"
                                                                    style="text-decoration:underline;background-color:#ffffff;border:solid 1px #3498db;border-radius:5px;box-sizing:border-box;color:#3498db;cursor:pointer;display:inline-block;font-size:14px;font-weight:bold;margin:0;padding:12px 25px;text-decoration:none;text-transform:capitalize;background-color:#3498db;border-color:#3498db;color:#ffffff;">
                                                                    Reset your password</a></td>
                                                          </tr>
                                                          </tbody>
                                                      </table>
                                                  </td>
                                              </tr>
                                              </tbody>
                                          </table>
                                          <p style="font-family:sans-serif;font-size:14px;font-weight:normal;margin:0;Margin-bottom:15px;">
                                          If you don’t use this link within 10 minutes, it will expire. To get a new password reset link, visit: http://localhost:3000/forgotPassword</p>
                                          <p style="font-family:sans-serif;font-size:14px;font-weight:normal;margin:0;Margin-bottom:15px;">
                                          Thanks,
                                          <br />
                                          The PlanMyTrip Team</p>
                                      </td>
                                  </tr>
                              </table>
                          </td>
                      </tr>
                      <!-- END MAIN CONTENT AREA -->
                  </table>
                  <!-- START FOOTER -->
                  <div class="footer" style="clear:both;padding-top:10px;text-align:center;width:100%;">
                      <table border="0" cellpadding="0" cellspacing="0"
                             style="border-collapse:separate;mso-table-lspace:0pt;mso-table-rspace:0pt;width:100%;">
                          <tr>
                              <td class="content-block"
                                  style="font-family:sans-serif;font-size:14px;vertical-align:top;color:#999999;font-size:12px;text-align:center;">
                                  <p style="font-family:sans-serif;font-size:14px;font-weight:normal;margin:0;Margin-bottom:15px;">
                                  Button not working? Paste the following link into your browser:
                                  <br />
                                  ${resetURL}</p>
                                </td>
                            </tr>
                            <br />
                          <tr>
                              <td class="content-block"
                                  style="font-family:sans-serif;font-size:14px;vertical-align:top;color:#999999;font-size:12px;text-align:center;">
                                  <p style="font-family:sans-serif;font-size:14px;font-weight:normal;margin:0;Margin-bottom:15px;">
                                  You're receiving this email because a password reset was requested for your account. If this wasn’t you, please ignore this email. Your account is safe.</p>
                                  <br>
                                  Don't like these emails? <a href="javascript:void(0)"
                                    style="color:#3498db;text-decoration:underline;color:#999999;font-size:12px;text-align:center;cursor:pointer;">Unsubscribe</a>.
                              </td>
                          </tr>
                          <tr>
                              <td class="content-block powered-by"
                                  style="font-family:sans-serif;font-size:14px;vertical-align:top;color:#999999;font-size:12px;text-align:center;">
                                  Powered by <a href="http://localhost:3000/about"
                                    style="color:#3498db;text-decoration:underline;color:#999999;font-size:12px;text-align:center;text-decoration:none;">PlanMyTrip</a>.
                              </td>
                          </tr>
                      </table>
                  </div>
                  <!-- END FOOTER -->
                  <!-- END CENTERED WHITE CONTAINER -->
              </div>
          </td>
          <td style="font-family:sans-serif;font-size:14px;vertical-align:top;">&nbsp;</td>
      </tr>
  </table>
  </body>
  </html>`;

    try {
        await sendEmail({
            email: user.email,
            subject: "[PlanMyTrip] Please reset your password",
            message,
            html: pwdTemplate,
        });
        res.status(200).json({
            status: "success",
            message: "Token sent to email!",
        });
    } catch (err) {
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save({ validateBeforeSave: false });

        return next(
            new appError("There was an error sending an email. Try again later.", 500)
        );
    }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
    //1) get user based on token
    const hashedToken = crypto
        .createHash("sha256")
        .update(req.params.token)
        .digest("hex");

    const user = await User.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: { $gt: Date.now() },
    });

    //2) if the token has not expired and there is user then set new password
    if (!user) {
        return next(new appError("Token is invalid or expired", 400));
    }
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    //3) update changePasswordAt property for user

    //4) log the user in, send JWT
    createSendToken(user, 200, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
    //1) get user from collection
    const user = await User.findById(req.user.id).select("+password");

    //2) check if posted current password is correct
    if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
        return next(new appError("Your current password is wrong", 401));
    }

    //3) If so, update password
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    await user.save();

    //4) Log user in, send JWT
    createSendToken(user, 200, res);
});

exports.verifyEmail = catchAsync(async (req, res, next) => {
    //1) get user based on posted email
    const user = await req.body.email;
    if (!user) {
        return next(new appError("Email can't be empty", 404));
    }

    //2) semd it to user's email
    const signupURL = `http://localhost:3000/signup`;
    const message = `Confirm that you are not robot and willing to signup in PlanMyTrip.com by clicking:
    ${signupURL} \nIf you are already registered or haven't applied, please ignore this email!`;
    let emailTemplate = `<!DOCTYPE html>
    <html>
    <head>
        <meta name="viewport" content="width=device-width">
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
        <title>Welcome {{name}}</title>
        <style type="text/css">
            @media only screen and (max-width: 620px) {
                table[class=body] h1 {
                    font-size: 28px !important;
                    margin-bottom: 10px !important;
                }
                table[class=body] p,
                table[class=body] ul,
                table[class=body] ol,
                table[class=body] td,
                table[class=body] span,
                table[class=body] a {
                    font-size: 16px !important;
                }
                table[class=body] .wrapper,
                table[class=body] .article {
                    padding: 10px !important;
                }
                table[class=body] .content {
                    padding: 0 !important;
                }
                table[class=body] .container {
                    padding: 0 !important;
                    width: 100% !important;
                }
                table[class=body] .main {
                    border-left-width: 0 !important;
                    border-radius: 0 !important;
                    border-right-width: 0 !important;
                }
                table[class=body] .btn table {
                    width: 100% !important;
                }
                table[class=body] .btn a {
                    width: 100% !important;
                }
                table[class=body] .img-responsive {
                    height: auto !important;
                    max-width: 100% !important;
                    width: auto !important;
                }
            }
            @media all {
                .ExternalClass {
                    width: 100%;
                }
                .ExternalClass,
                .ExternalClass p,
                .ExternalClass span,
                .ExternalClass font,
                .ExternalClass td,
                .ExternalClass div {
                    line-height: 100%;
                }
                .apple-link a {
                    color: inherit !important;
                    font-family: inherit !important;
                    font-size: inherit !important;
                    font-weight: inherit !important;
                    line-height: inherit !important;
                    text-decoration: none !important;
                }
                .btn-primary table td:hover {
                    background-color: #34495e !important;
                }
                .btn-primary a:hover {
                    background-color: #34495e !important;
                    border-color: #34495e !important;
                }
            }
        </style>
    </head>
    <body class=""
          style="background-color:#f6f6f6;font-family:sans-serif;-webkit-font-smoothing:antialiased;font-size:14px;line-height:1.4;margin:0;padding:0;-ms-text-size-adjust:100%;-webkit-text-size-adjust:100%;">
    <table border="0" cellpadding="0" cellspacing="0" class="body"
           style="border-collapse:separate;mso-table-lspace:0pt;mso-table-rspace:0pt;background-color:#f6f6f6;width:100%;">
        <tr>
            <td style="font-family:sans-serif;font-size:14px;vertical-align:top;">&nbsp;</td>
            <td class="container"
                style="font-family:sans-serif;font-size:14px;vertical-align:top;display:block;max-width:580px;padding:10px;width:580px;Margin:0 auto !important;">
                <div class="content"
                     style="box-sizing:border-box;display:block;Margin:0 auto;max-width:580px;padding:10px;">
                    <!-- START CENTERED WHITE CONTAINER -->
                    <span class="preheader"
                          style="color:transparent;display:none;height:0;max-height:0;max-width:0;opacity:0;overflow:hidden;mso-hide:all;visibility:hidden;width:0;">Please verify your email address.</span>
                    <table class="main"
                           style="border-collapse:separate;mso-table-lspace:0pt;mso-table-rspace:0pt;background:#fff;border-radius:3px;width:100%;">
                        <!-- START MAIN CONTENT AREA -->
                        <tr>
                            <td class="wrapper"
                                style="font-family:sans-serif;font-size:14px;vertical-align:top;box-sizing:border-box;padding:20px;">
                                <table border="0" cellpadding="0" cellspacing="0"
                                       style="border-collapse:separate;mso-table-lspace:0pt;mso-table-rspace:0pt;width:100%;">
                                    <tr>
                                        <td style="font-family:sans-serif;font-size:14px;vertical-align:top;">
                                            <p style="font-family:sans-serif;font-size:14px;font-weight:normal;margin:0;Margin-bottom:15px;">
                                                Hello!</p>
                                            <p style="font-family:sans-serif;font-size:14px;font-weight:normal;margin:0;Margin-bottom:15px;">
                                            To secure your PlanMyTrip account, we just need to verify your email address:
                                            ${user}
                                            <br />
                                            <table border="0" cellpadding="0" cellspacing="0" class="btn btn-primary"
                                                   style="border-collapse:separate;mso-table-lspace:0pt;mso-table-rspace:0pt;box-sizing:border-box;width:100%;">
                                                <tbody>
                                                <tr>
                                                    <td align="left"
                                                        style="font-family:sans-serif;font-size:14px;vertical-align:top;padding-bottom:15px;">
                                                        <table border="0" cellpadding="0" cellspacing="0"
                                                               style="border-collapse:separate;mso-table-lspace:0pt;mso-table-rspace:0pt;width:100%;width:auto;">
                                                            <tbody>
                                                            <tr>
                                                                <td style="font-family:sans-serif;font-size:14px;vertical-align:top;background-color:#ffffff;border-radius:5px;text-align:center;background-color:#3498db;">
                                                                    <a href=${signupURL} target="_blank"
                                                                      style="text-decoration:underline;background-color:#ffffff;border:solid 1px #3498db;border-radius:5px;box-sizing:border-box;color:#3498db;cursor:pointer;display:inline-block;font-size:14px;font-weight:bold;margin:0;padding:12px 25px;text-decoration:none;text-transform:capitalize;background-color:#3498db;border-color:#3498db;color:#ffffff;">
                                                                      Verify email address</a></td>
                                                            </tr>
                                                            </tbody>
                                                        </table>
                                                    </td>
                                                </tr>
                                                </tbody>
                                            </table>
                                            <p style="font-family:sans-serif;font-size:14px;font-weight:normal;margin:0;Margin-bottom:15px;">
                                            Thanks,
                                            <br />
                                            The PlanMyTrip Team</p>
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                        <!-- END MAIN CONTENT AREA -->
                    </table>
                    <!-- START FOOTER -->
                    <div class="footer" style="clear:both;padding-top:10px;text-align:center;width:100%;">
                        <table border="0" cellpadding="0" cellspacing="0"
                               style="border-collapse:separate;mso-table-lspace:0pt;mso-table-rspace:0pt;width:100%;">
                            <tr>
                                <td class="content-block"
                                    style="font-family:sans-serif;font-size:14px;vertical-align:top;color:#999999;font-size:12px;text-align:center;">
                                    <p style="font-family:sans-serif;font-size:14px;font-weight:normal;margin:0;Margin-bottom:15px;">
                                    Button not working? Paste the following link into your browser:
                                    <br />
                                    ${signupURL}</p>
                                  </td>
                            </tr>
                            <br />
                            <tr>
                                <td class="content-block"
                                    style="font-family:sans-serif;font-size:14px;vertical-align:top;color:#999999;font-size:12px;text-align:center;">
                                    <p style="font-family:sans-serif;font-size:14px;font-weight:normal;margin:0;Margin-bottom:15px;">
                                    You’re receiving this email because you recently created a new PlanMyTrip account. If this wasn’t you, please ignore this email.</p>
                                    <br>
                                </td>
                            </tr>
                            <tr>
                                <td class="content-block powered-by"
                                    style="font-family:sans-serif;font-size:14px;vertical-align:top;color:#999999;font-size:12px;text-align:center;">
                                    Powered by <a href="http://localhost:3000/about"
                                      style="color:#3498db;text-decoration:underline;color:#999999;font-size:12px;text-align:center;text-decoration:none;">PlanMyTrip</a>.
                                </td>
                            </tr>
                        </table>
                    </div>
                    <!-- END FOOTER -->
                    <!-- END CENTERED WHITE CONTAINER -->
                </div>
            </td>
            <td style="font-family:sans-serif;font-size:14px;vertical-align:top;">&nbsp;</td>
        </tr>
    </table>
    </body>
    </html>`;

    try {
        await sendEmail({
            email: user,
            subject: "[PlanMyTrip] Please verify your email address",
            message,
            html: emailTemplate,
        });
        res.status(200).json({
            status: "success",
            message: "Token sent to email!",
        });
    } catch (err) {
        return next(
            new appError("There was an error sending an email. Try again later.", 500)
        );
    }
});