function(accessToken, ctx, cb) {
  const baseUrl = 'https://people.googleapis.com/v1/people/me?personFields=emailAddresses,phoneNumbers,birthdays,genders,names,photos';
  const options = {
    url: baseUrl,
    headers: {
      Authorization: `Bearer ${accessToken}`
    },
  };

  request(options, (err, response, body) => {
    if (err) {
      console.log(err.error);
      cb(err, null);
    } else {
      const user = JSON.parse(body);
      const profile = {
        user_id: user.resourceName.split('/')[1],
        email: user.emailAddresses[0].value,
        email_verified: user.emailAddresses[0].metadata.verified,
        name: user.names[0].displayName,
        family_name: user.names[0].familyName,
        given_name: user.names[0].givenName,
        picture: user.photos[0].url,
        user_metadata: user,
      };
      cb(null, profile);
    }
  });
}