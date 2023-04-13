import React, {useEffect, useState} from 'react';
import {
  Dimensions,
  FlatList,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Toast from 'react-native-simple-toast';
import {useDispatch, useSelector} from 'react-redux';
import {Colors} from '../../colors';
import {Buttons, OverlayModal} from '../../components';
import {FONTS_SIZES} from '../../fonts';
import {getClosetData} from '../../redux/actions/closetAction';
import {getOutfitsList} from '../../redux/actions/outfitActions';
import {
  recommendedAction,
  recommendedProductsAction,
} from '../../redux/actions/stylistAction';

export const RenderItem = ({item, menuSelected, recommendToClients}) => {
  if (menuSelected === 'Closet') {
    return <RenderCloset item={item} />;
  }
  if (menuSelected === 'Outfits') {
    return <RenderOutfits item={item} />;
  }
  return (
    <RenderRecommenedProducts
      item={item}
      recommendToClients={recommendToClients}
    />
  );
};

export const RenderCloset = ({item}) => {
  return (
    <View style={{margin: 8}}>
      <Image
        source={{uri: item.itemImageUrl}}
        style={{width: 144, height: 164}}
      />
    </View>
  );
};

export const RenderOutfits = ({item}) => {
  return (
    <View style={{margin: 8}}>
      <Image
        source={{uri: item.outfitImageType}}
        style={{width: Dimensions.get('window').width / 2 - 24, height: 164}}
      />
      <Text style={{marginTop: 8}}>{item.name}</Text>
    </View>
  );
};

export const RenderRecommenedProducts = ({item, recommendToClients}) => {
  return (
    <View style={{margin: 8, paddingTop: 30}}>
      {item.isDisliked ? (
        <View
          style={{
            backgroundColor: '#CE1A1A14',
            paddingHorizontal: 8,
            paddingVertical: 8,
            position: 'absolute',
            right: 0,
          }}>
          <Text style={{color: '#CE1A1A99'}}>not liked by client</Text>
        </View>
      ) : null}
      <Image
        source={{uri: item.imageUrls[0]}}
        style={{width: Dimensions.get('window').width / 2 - 24, height: 164}}
      />
      <TouchableOpacity style={{marginTop: 8}} onPress={recommendToClients}>
        <Image
          source={require('../../assets/iRecommend.png')}
          style={{
            height: 24,
            width: 24,
          }}
          resizeMode="contain"
        />
      </TouchableOpacity>
      <Text style={{marginTop: 8}}>Black and White</Text>
      <Text>$100</Text>
    </View>
  );
};

const ClientDetails = props => {
  const dispatch = useDispatch();
  const allClientDataRespo = useSelector(
    state => state.StylistReducer.allClientDataRespo,
  );
  const [clinetData, setClientData] = useState(props?.route?.params?.item);
  const [menu, setMenu] = useState(['Closet', 'Outfits', 'Recommended by you']);
  const [menuSelected, setMenuSelected] = useState('Closet');
  const getcloset = useSelector(state => state.ClosetReducer.getcloset);
  const getOutfitData = useSelector(state => state.OutfitReducer.getOutfitData);
  const recommendedProductsClientsRes = useSelector(
    state => state.StylistReducer.recommendedProductsClientsRes,
  );
  const userId = useSelector(state => state.AuthReducer.userId);
  const [selectedClients, setSelectedClients] = useState([]);
  const [showClientModal, setShowClientModal] = useState(false);
  const [recommendedProductId, setRecommendedProductId] = useState('');
  const recommendedToClientsRes = useSelector(
    state => state.StylistReducer.recommendedToClientsRes,
  );

  useEffect(() => {
    if (Object.keys(recommendedToClientsRes).length) {
      if (recommendedToClientsRes.statusCode === 200) {
        setSelectedClients([]);
        dispatch({type: 'RECOMMENDED_TO_CLIENTS', value: {}});
        Toast.show('Recommended to clients successfuly');
      }
    }
  }, [recommendedToClientsRes, dispatch]);

  useEffect(() => {
    if (props?.route?.params?.item) {
      dispatch(getClosetData(props?.route?.params?.item?.userId));
      dispatch(getOutfitsList(props?.route?.params?.item?.userId));
      dispatch(recommendedProductsAction(props?.route?.params?.item?.userId));
    }
  }, [dispatch, props?.route?.params?.item]);

  const onPress = item => {
    setMenuSelected(item);
  };

  const recommendToClients = item => {
    if (!selectedClients.length) {
      Toast.show('Please select atleast one client');
      return;
    }
    const data = {
      personalStylistId: userId,
      userIds: selectedClients,
      productId: recommendedProductId,
    };
    setShowClientModal(false);
    dispatch(recommendedAction(data));
  };

  const recommentToClient = item => {
    setShowClientModal(true);
    setRecommendedProductId(item.productId);
  };

  const selectClient = item => {
    let selectedClients1 = [...selectedClients];
    if (!selectedClients1.includes(item.userId)) {
      selectedClients1.push(item.userId);
    } else {
      selectedClients1 = selectedClients1.filter(id => id !== item.userId);
    }
    setSelectedClients(selectedClients1);
  };

  const ClientList = ({item, index}) => {
    return (
      <TouchableOpacity
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginVertical: 8,
        }}
        onPress={() => selectClient(item)}>
        <View style={{flexDirection: 'row'}}>
          {item.profilePicUrl ? (
            <Image
              source={{uri: item.profilePicUrl}}
              style={{width: 40, height: 40}}
            />
          ) : (
            <Image
              source={require('../../assets/iProfile.png')}
              style={{width: 40, height: 40}}
            />
          )}
          <View style={{marginLeft: 8}}>
            <Text>{item.name}</Text>
            <Text style={{color: Colors.black30}}>{item.emailId}</Text>
          </View>
        </View>

        <View>
          <Image
            source={
              selectedClients.includes(item.userId)
                ? require('../../assets/iSelectedCheck.png')
                : require('../../assets/iCheck.png')
            }
            style={{width: 16, height: 16}}
            resizeMode="contain"
          />
        </View>
      </TouchableOpacity>
    );
  };

  const RenderClients = () => {
    return (
      <View>
        <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
          <View>
            <Text style={{fontSize: FONTS_SIZES.s3, fontWeight: 'bold'}}>
              Recommend to your clients
            </Text>
          </View>
          <TouchableOpacity onPress={() => setShowClientModal(false)}>
            <Image
              source={require('../../assets/cross.webp')}
              style={{width: 32, height: 32}}
            />
          </TouchableOpacity>
        </View>
        <View style={{marginVertical: 16}}>
          {allClientDataRespo.map((item, index) => {
            return <ClientList item={item} index={index} />;
          })}
        </View>
        <Buttons text="recommend" onPress={recommendToClients} />
      </View>
    );
  };

  return (
    <View style={{flex: 1, padding: 20, backgroundColor: 'white'}}>
      <View style={{flexDirection: 'row', alignItems: 'center'}}>
        <TouchableOpacity
          style={{padding: 5}}
          onPress={() => props.navigation.goBack()}>
          <Image
            resizeMode="contain"
            source={require('../../assets/iBack.webp')}
            style={{width: 24, height: 18}}
          />
        </TouchableOpacity>
        <View style={{flexDirection: 'row', marginLeft: 12}}>
          {clinetData.profilePicUrl ? (
            <Image
              source={{uri: clinetData.profilePicUrl}}
              style={{width: 40, height: 40, borderRadius: 20}}
            />
          ) : (
            <Image
              source={require('../../assets/iProfile.png')}
              style={{width: 40, height: 40}}
            />
          )}
          <View style={{marginLeft: 8}}>
            <Text>{clinetData.name}</Text>
            <Text style={{color: Colors.black30}}>{clinetData.emailId}</Text>
          </View>
        </View>
      </View>
      <View style={{marginTop: 12}}>
        <ScrollView horizontal bounces={false}>
          <View style={{flexDirection: 'row'}}>
            {menu.map(item => {
              return (
                <TouchableOpacity
                  style={{
                    padding: 8,
                    borderBottomWidth: 1,
                    borderBottomColor:
                      item === menuSelected ? 'black' : 'transparent',
                  }}
                  onPress={() => onPress(item)}>
                  <Text
                    style={{
                      color: menuSelected === item ? 'black' : Colors.black60,
                    }}>
                    {item}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>

        <FlatList
          data={
            menuSelected === 'Closet'
              ? getcloset
              : menuSelected === 'Outfits'
              ? getOutfitData
              : recommendedProductsClientsRes
          }
          showsVerticalScrollIndicator={false}
          numColumns={2}
          ListEmptyComponent={() => (
            <View
              style={{
                flex: 1,
                alignItems: 'center',
                paddingTop: 150,
              }}>
              <Text style={{color: Colors.black60}}>No Data Found</Text>
            </View>
          )}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({item, index}) => (
            <RenderItem
              item={item}
              menuSelected={menuSelected}
              recommendToClients={() => recommentToClient(item)}
            />
          )}
        />
      </View>
      {showClientModal && (
        <OverlayModal
          isScrollEnabled={false}
          showModal={showClientModal}
          component={RenderClients()}
        />
      )}
    </View>
  );
};

export default ClientDetails;
