import React, { useState } from 'react';
import { Button, ImageBackground, View, Text, StyleSheet, TouchableOpacity, TextInput, Platform } from 'react-native';
import { WebView } from 'react-native-webview';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as Location from 'expo-location';

const API_URL = 'http://ec2-34-245-52-7.eu-west-1.compute.amazonaws.com:3000';


function HomeScreen({ navigation, route }) {
    React.useLayoutEffect(() => {
        navigation.setOptions({
        headerRight: () => 
            <Button onPress={() => navigation.navigate('Login')} title="Logout" />
        });
    }, [navigation]);

    return (
        <ImageBackground source={require('../public/images/gradient-back.jpeg')} style={styles.image}>
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                <Text>Home Screen</Text>
                <Text>{route.params.user}</Text>
                <Button
                    title="Sign Out"
                    onPress={() => navigation.navigate('Login')}
                />
            </View>
        </ImageBackground>
    );
}


function MapScreen({ navigation }) {
    React.useLayoutEffect(() => {
        navigation.setOptions({
        headerRight: () => 
            <Button onPress={() => navigation.navigate('Login')} title="Logout" />
        });
    }, [navigation]);
    
    const iframeString = '<iframe src="https://map.openchargemap.io/?mode=embedded&latitude=52.4861&longitude=-9.3123" frameborder="0" width="100%" height="1700px"></iframe>'

    return (
        <WebView
          scalesPageToFit={true}
          bounces={false}
          allowsFullscreenVideo={true}
          javaScriptEnabled
          source={{
            html: `
                  <!DOCTYPE html>
                  <html>
                    <head></head>
                    <body>
                      <div>${iframeString}</div>
                    </body>
                  </html>
            `,
          }}
          automaticallyAdjustContentInsets={false}
        />
    );
}


function SOSScreen({ navigation }) {
    React.useLayoutEffect(() => {
        navigation.setOptions({
        headerRight: () => 
            <Button onPress={() => navigation.navigate('Login')} title="Logout" />
        });
    }, [navigation]);

    const [location, setLocation] = useState(null);
    const [errorMsg, setErrorMsg] = useState(null);

    React.useEffect(() => {
        (async () => {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                setErrorMsg('Permission to access location was denied');
                return;
            }

            let location = await Location.getCurrentPositionAsync({});
            setLocation(location);
        })();
    }, []);

    let text = 'Waiting..';
    if (errorMsg) {
        text = errorMsg;
    } else if (location) {
        text = JSON.stringify(location);
    }

    return (
        <ImageBackground source={require('../public/images/gradient-back.jpeg')} style={styles.image}>
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                <View style={styles.container}>
                    <Text style={styles.paragraph}>{text}</Text>
                </View>
            </View>
        </ImageBackground>
    );
}


function LoginScreen({ navigation }) {

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const [isError, setIsError] = useState(false);
    const [message, setMessage] = useState('');

    const onLoggedIn = token => {
        fetch(`${API_URL}/private`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        })
            .then(async res => {
                try {
                    const jsonRes = await res.json();
                    if (res.status === 200) {
                        setMessage(jsonRes.message);
                        navigation.navigate('Root', { screen: 'Home' });
                    }
                } catch (err) {
                    console.log(err);
                };
            })
            .catch(err => {
                console.log(err);
            });
    }

    const onSubmitHandler = () => {
        const payload = {
            email,
            password,
        };
        fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        })
            .then(async res => {
                try {
                    const jsonRes = await res.json();
                    if (res.status !== 200) {
                        setIsError(true);
                        setMessage(jsonRes.message + '\nPlease try again or click\nForgot Password above to reset it.');
                    } else {
                        onLoggedIn(jsonRes.token);
                        setIsError(false);
                        setMessage(jsonRes.message);
                    }
                } catch (err) {
                    console.log(err);
                };
            })
            .catch(err => {
                console.log(err);
            });
    };

    const getMessage = () => {
        const status = isError ? `Error: ` : `Success: `;
        return status + message;
    }

    return (
        <ImageBackground source={require('../public/images/gradient-back.jpeg')} style={styles.image}>
            <View style={styles.card}>
                <Text style={styles.heading}>{'Login'}</Text>
                <View style={styles.form}>
                    <View style={styles.inputs}>
                        <TextInput style={styles.input} placeholder="Email" autoCapitalize="none" onChangeText={setEmail}></TextInput>
                        <TextInput secureTextEntry={true} style={styles.input} placeholder="Password" onChangeText={setPassword}></TextInput>
                        <Text style={[styles.message, { color: isError ? 'red' : 'green' }]}>{message ? getMessage() : null}</Text>
                        <TouchableOpacity style={styles.button} onPress={onSubmitHandler}>
                            <Text style={styles.buttonText}>Login</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.buttonAlt} onPress={() => navigation.navigate('SignUp')}>
                            <Text style={styles.buttonAltText}>{'Dont have an account? Sign Up'}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.buttonAlt} onPress={() => navigation.navigate('Root', { screen: 'Home', params: { user: "Jane" }})}>
                            <Text style={styles.buttonAltText}>{'Forgot Password'}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </ImageBackground>
    );
};


function SignUpScreen({ navigation }) {

    const [email, setEmail] = useState('');
    const [name, setName] = useState('');
    const [password, setPassword] = useState('');

    const [isError, setIsError] = useState(false);
    const [message, setMessage] = useState('');

    const onSubmitHandler = () => {
        const payload = {
            email,
            name,
            password,
        };
        fetch(`${API_URL}/signup`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        })
            .then(async res => {
                try {
                    const jsonRes = await res.json();
                    if (res.status !== 200) {
                        setIsError(true);
                        setMessage(jsonRes.message);
                    } else {
                        setIsError(false);
                        setMessage(jsonRes.message + '\nPlease return to login screen');
                    }
                } catch (err) {
                    console.log(err);
                };
            })
            .catch(err => {
                console.log(err);
            });
    };

    const getMessage = () => {
        const status = isError ? `Error: ` : `Success: `;
        return status + message;
    }

    return (
        <ImageBackground source={require('../public/images/gradient-back.jpeg')} style={styles.image}>
            <View style={styles.card}>
                <Text style={styles.heading}>{'Sign Up'}</Text>
                <View style={styles.form}>
                    <View style={styles.inputs}>
                        <TextInput style={styles.input} placeholder="Email" autoCapitalize="none" onChangeText={setEmail}></TextInput>
                        <TextInput style={styles.input} placeholder="Name" onChangeText={setName}></TextInput>
                        <TextInput secureTextEntry={true} style={styles.input} placeholder="Password" onChangeText={setPassword}></TextInput>
                        <Text style={[styles.message, { color: isError ? 'red' : 'green' }]}>{message ? getMessage() : null}</Text>
                        <TouchableOpacity style={styles.button} onPress={onSubmitHandler}>
                            <Text style={styles.buttonText}>Sign Up</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.buttonAlt} onPress={() => navigation.navigate('Login')}>
                            <Text style={styles.buttonAltText}>{'Return to Login'}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </ImageBackground>
    );
};


const styles = StyleSheet.create({
    image: {
        flex: 1,
        width: '100%',
        alignItems: 'center',
    },
    card: {
        flex: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.4)',
        width: '80%',
        marginTop: '40%',
        borderRadius: 20,
        maxHeight: 380,
        paddingBottom: '30%',
    },
    heading: {
        fontSize: 30,
        fontWeight: 'bold',
        marginLeft: '10%',
        marginTop: '5%',
        marginBottom: '30%',
        color: 'black',
    },
    form: {
        flex: 1,
        justifyContent: 'space-between',
        paddingBottom: '5%',
    },
    inputs: {
        width: '100%',
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: '10%',
    },
    input: {
        width: '80%',
        borderBottomWidth: 1,
        borderBottomColor: 'black',
        paddingTop: 10,
        fontSize: 16,
        minHeight: 40,
    },
    button: {
        width: '80%',
        backgroundColor: 'black',
        height: 40,
        borderRadius: 50,
        justifyContent: 'center',
        alignItems: 'center',
        marginVertical: 5,
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '400'
    },
    buttonAlt: {
        width: '80%',
        borderWidth: 1,
        height: 40,
        borderRadius: 50,
        borderColor: 'black',
        justifyContent: 'center',
        alignItems: 'center',
        marginVertical: 5,
    },
    buttonAltText: {
        color: 'black',
        fontSize: 16,
        fontWeight: '400',
    },
    message: {
        fontSize: 16,
        marginVertical: '5%',
    },
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
    },
    paragraph: {
        fontSize: 18,
        textAlign: 'center',
    },
});


const Tab = createBottomTabNavigator();

function Root() {
    return (
        <Tab.Navigator>
            <Tab.Screen name="Home" component={HomeScreen} options={{
            headerRight: () => (
                <Button
                    onPress={() => navigation.navigate('Login')}
                    title="Logout"
                    color="#00cc00" />
                ),
            }}/>
            <Tab.Screen name="Map" component={MapScreen} />
            <Tab.Screen name="SOS" component={SOSScreen} />
        </Tab.Navigator>
    );
}


const Stack = createNativeStackNavigator();

function Screen() {
    return (
        <Stack.Navigator initialRouteName="Login">
            <Stack.Screen
                name="Root"
                component={Root}
                options={{ headerShown: false }}
            />
            <Stack.Screen name="Login" component={LoginScreen} options={{ title: "Login" }} />
            <Stack.Screen name="SignUp" component={SignUpScreen} options={{ title: "SignUp" }} />
        </Stack.Navigator>
    );
}


export default Screen;