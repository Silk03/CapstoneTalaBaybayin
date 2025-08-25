import React from 'react';
import { ExternalLink } from './ExternalLink';
import { MonoText } from './StyledText';
import { Text, View } from './Themed';
import Colors from '@/constants/Colors';
import '../global.css';

export default function EditScreenInfo({ path }: { path: string }) {
  return (
    <View>
      <View className="items-center mx-12">
        <Text
          className="text-base leading-6 text-center"
          lightColor="rgba(0,0,0,0.8)"
          darkColor="rgba(255,255,255,0.8)">
          Buksan ang code para sa screen na ito:
        </Text>

        <View
          className="rounded-lg px-1 py-2 my-2"
          darkColor="rgba(255,255,255,0.05)"
          lightColor="rgba(0,0,0,0.05)">
          <MonoText>{path}</MonoText>
        </View>

        <Text
          className="text-base leading-6 text-center"
          lightColor="rgba(0,0,0,0.8)"
          darkColor="rgba(255,255,255,0.8)">
          Baguhin ang anumang teksto, i-save ang file, at automatic na mag-uupdate ang inyong app.
        </Text>
      </View>

      <View className="items-center mx-12 mt-4">
        <ExternalLink
          className="py-4"
          href="https://docs.expo.io/get-started/create-a-new-app/#opening-the-app-on-your-phonetablet">
          <Text className="text-base leading-6 text-center text-secondary">
            Pindutin dito kung hindi automatic na nag-uupdate ang inyong app pagkatapos gumawa ng mga pagbabago
          </Text>
        </ExternalLink>
      </View>
    </View>
  );
}


