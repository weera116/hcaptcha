# HCAPTCHA Nginx Server

This Repo consists of a nginx proxy serving the hcaptcha html template and also a nodejs server for validation.

## Getting Started
### Prerequisite
A proxy setup is required. Details are in [PROXY_SETUP.md](PROXY_SETUP.md).
Modify `docker-compose.yaml` and replace the following environment variables according to your usage for ssl cert generation.
```yaml
VIRTUAL_HOST: <yourdomain>
LETSENCRYPT_HOST: <yourdomain>
LETSENCRYPT_EMAIL: <email>
```
Please note that you have configured your domain dns settings before spinning up the containers.

### Example Usage (Flutter)
```dart
class Captcha extends StatefulWidget {
  Function(bool success) callback;
  Captcha(this.callback);
  @override
  State<StatefulWidget> createState() {
    return CaptchaState();
  }
}

class CaptchaState extends State<Captcha> {
  late WebViewController webViewController;
  @override
  void initState() {
    super.initState();
    if (kIsWeb) {
      ui.platformViewRegistry.registerViewFactory(
          'hcaptcha-html',
          (int viewId) => html.IFrameElement()
            ..src = "https://YOUR_DOMAIN"
            ..style.border = 'none'
            ..width = '320'
            ..height = '240');
    }
    html.window.onMessage.forEach((element) {
      verifyToken(element.data);
    });
  }

  Future<void> verifyToken(String token) async {
    try {
      final String url = "https://YOUR_DOMAIN/api/siteverify/$token";
      final res = await Dio().get(
        url,
      );
      final decoded = res.data;
      if (res.statusCode != 200) {
        widget.callback(false);
        throw Exception(decoded['message']);
      }
      widget.callback(true);
    } catch (e) {
      widget.callback(false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Center(
        child: kIsWeb
            ? HtmlElementView(viewType: 'hcaptcha-html')
            : WebView(
                initialUrl: "https://YOUR_DOMAIN",
                javascriptMode: JavascriptMode.unrestricted,
                javascriptChannels: Set.from([
                  JavascriptChannel(
                      name: 'Captcha',
                      onMessageReceived: (JavascriptMessage message) async {
                        // message contains the 'h-captcha-response' token.
                        // Send it to your server in the login or other
                        // data for verification via /siteverify
                        // see: https://docs.hcaptcha.com/#server
                        // print(message.message);
                        verifyToken(message.message);
                        Navigator.of(context).pop();
                      })
                ]),
                onWebViewCreated: (WebViewController w) {
                  webViewController = w;
                },
              ));
  }
}
```
