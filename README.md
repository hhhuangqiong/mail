# Project

## APIs

```
# get the token metadata
GET /tokens/:token

# update the token metadata
POST /tokens/:token

# send (and create) the email
POST /emails
```


```
// sample code for using email client
router.post('/whatever', function(req, res) {
  return emailClient.send({
    subject: "test",
    from: "noreply@m800.com",
    to: "gilbertwong@maaii.com"
  }, {
    name: "test",
    language: "en-US",
    data: {
      host: "http://partner.m800.com"
    }
  }, function(err, token) {
    if(err) logger.error('Failed to send email', err)
    res.json({ token: token });
  });
});
```

## Template solution

- https://github.com/mailgun/transactional-email-templates

## TODO

- better test coverage
- better email template (responsive) template
  - include authoring (process)

## Reference

- https://github.com/niftylettuce/node-email-templates/pull/147
- https://www.campaignmonitor.com/css/

